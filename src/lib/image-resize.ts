/**
 * Image resizing utilities using Canvas API
 * Keeps original format (JPEG/PNG) and resizes to fit within max dimensions
 * while maintaining aspect ratio.
 */

export interface ResizeOptions {
  maxDimension: number
  quality?: number
  maxCanvasSize?: number
}

export interface ResizeResult {
  blob: Blob
  width: number
  height: number
  wasResized: boolean
}

/**
 * Resize an image file to fit within maxDimension while maintaining aspect ratio.
 * 
 * @param file - The image file to resize
 * @param options - Resize options
 * @returns Promise with the resized blob and metadata
 */
export async function resizeImage(
  file: File | Blob,
  options: ResizeOptions
): Promise<ResizeResult> {
  const {
    maxDimension,
    quality = 0.85,
    maxCanvasSize = 4096 // Cap to prevent memory issues
  } = options

  // Load the image
  const img = await loadImage(file)
  const originalWidth = img.width
  const originalHeight = img.height

  // Check if resizing is needed
  if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
    // No resize needed, return original (File extends Blob)
    return {
      blob: file,
      width: originalWidth,
      height: originalHeight,
      wasResized: false
    }
  }

  // Calculate new dimensions maintaining aspect ratio
  let targetWidth
  let targetHeight

  if (originalWidth > originalHeight) {
    targetWidth = Math.min(maxDimension, maxCanvasSize)
    targetHeight = Math.round((originalHeight / originalWidth) * targetWidth)
  } else {
    targetHeight = Math.min(maxDimension, maxCanvasSize)
    targetWidth = Math.round((originalWidth / originalHeight) * targetHeight)
  }

  // Additional safety check to cap canvas size
  if (targetWidth > maxCanvasSize || targetHeight > maxCanvasSize) {
    const scale = maxCanvasSize / Math.max(targetWidth, targetHeight)
    targetWidth = Math.round(targetWidth * scale)
    targetHeight = Math.round(targetHeight * scale)
  }

  // Create canvas and resize
  const canvas = document.createElement("canvas")
  canvas.width = targetWidth
  canvas.height = targetHeight

  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Failed to get canvas context")
  }

  // Use better quality scaling
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"

  // Draw the resized image
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

  // Convert to blob with appropriate format and quality
  const mimeType = getMimeType(file)
  const blob = await canvasToBlob(canvas, mimeType, quality)

  return {
    blob,
    width: targetWidth,
    height: targetHeight,
    wasResized: true
  }
}

/**
 * Load an image from a File or Blob
 */
function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image"))
    }

    img.src = url
  })
}

/**
 * Convert canvas to blob with proper format
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error("Failed to convert canvas to blob"))
        }
      },
      mimeType,
      quality
    )
  })
}

/**
 * Get the MIME type from a file, ensuring we keep JPEG/PNG
 */
function getMimeType(file: File | Blob): string {
  const type = file.type.toLowerCase()

  // Keep JPEG and PNG, default to JPEG for others
  if (type === "image/png") {
    return "image/png"
  }

  // Normalize JPEG variations
  if (type === "image/jpeg" || type === "image/jpg") {
    return "image/jpeg"
  }

  // Default to JPEG for other image types
  return "image/jpeg"
}
