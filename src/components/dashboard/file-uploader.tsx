import { useEffect, useRef, useState } from "react"
import * as Sentry from "@sentry/nextjs"
import AwsS3 from "@uppy/aws-s3"
import Compressor from "@uppy/compressor"
import Uppy, {
  type Body,
  type Meta,
  type UploadResult,
  type UppyEventMap,
  type UppyFile
} from "@uppy/core"
import ImageEditor from "@uppy/image-editor"
import Spanish from "@uppy/locales/lib/es_MX"
import Dashboard from "@uppy/react/dashboard"

// Uppy styles
import "@uppy/core/css/style.min.css"
import "@uppy/dashboard/css/style.min.css"
import "@uppy/image-editor/css/style.min.css"

// import "@uppy/webcam/dist/style.min.css"

// import Webcam from "@uppy/webcam"
import { useTheme } from "next-themes"

import {
  getHttpStatus,
  hasSuccessfulUpload,
  requestPresignedUpload
} from "@/components/dashboard/file-uploader-upload"
import { resizeImage } from "@/lib/image-resize"
import { type ImageType } from "@/lib/types/media"

interface UploadFileMeta extends Meta {
  storageKey?: string
  width?: number
  height?: number
  bytes?: number
  [key: string]: unknown
}

const toFiniteNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined

export function FileUploader({
  organizationId,
  imageType,
  objectId,
  onUploadSuccess,
  onUploadError,
  onUpgradeRequired,
  limitDimension = 1200,
  maxFileSize
}: {
  organizationId: string
  imageType: ImageType
  objectId: string
  onUploadSuccess: (result: UploadResult<Meta, Body>) => void
  onUploadError?: (error: Error) => void
  onUpgradeRequired?: () => void
  limitDimension?: number
  maxFileSize?: number
}) {
  const { theme } = useTheme()
  const effectiveMaxFileSize = maxFileSize ?? 3 * 1024 * 1024
  const destroyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const uploadContextRef = useRef({
    organizationId,
    imageType,
    objectId,
    limitDimension,
    onUploadSuccess,
    onUploadError,
    onUpgradeRequired
  })
  uploadContextRef.current = {
    organizationId,
    imageType,
    objectId,
    limitDimension,
    onUploadSuccess,
    onUploadError,
    onUpgradeRequired
  }

  const [uppy] = useState(() => {
    const instance = new Uppy<UploadFileMeta, Body>({
      autoProceed: false,
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: [".jpg", ".jpeg", ".png"],
        maxFileSize: effectiveMaxFileSize
      },
      locale: Spanish
    })

    instance.use(AwsS3, {
      shouldUseMultipart: false,
      signRequest: async request => {
        if (request.method !== "PUT") {
          throw new Error(`Unexpected S3 signing method: ${request.method}`)
        }

        const [file] = instance.getFiles()
        if (!file || file.isRemote || !file.data) {
          throw new Error("No local file is available for upload signing")
        }

        const { width, height } = await getImageDimensions(file.data)
        const bytes = toFiniteNumber(file.size) ?? file.data.size
        instance.setFileMeta(file.id, { width, height, bytes })

        const context = uploadContextRef.current
        const upload = await requestPresignedUpload({
          organizationId: context.organizationId,
          imageType: context.imageType,
          objectId: context.objectId,
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          width,
          height,
          bytes
        })
        instance.setFileMeta(file.id, { storageKey: upload.storageKey })

        return { url: upload.url }
      }
    })
    instance.use(ImageEditor, {
      quality: 0.8
    })
    instance.use(Compressor, {
      locale: {
        strings: {
          // Shown in the Status Bar
          compressingImages: "Optimizando imágenes...",
          compressedX: "Ahorro de %{size} al optimizar imágenes"
        },
        pluralize: function (n) {
          return n === 1 ? 0 : 1
        }
      }
    })

    return instance
  })

  useEffect(() => {
    const handleFileAdded = async (file: UppyFile<UploadFileMeta, Body>) => {
      // If the file is an image, get the dimensions and resize if needed
      if (file.type.startsWith("image/") && !file.isRemote && file.data) {
        try {
          const image = await getImageDimensions(file.data)
          const width = toFiniteNumber(image.width)
          const height = toFiniteNumber(image.height)
          const bytes = toFiniteNumber(file.size)
          if (
            width !== undefined &&
            height !== undefined &&
            bytes !== undefined
          ) {
            uppy.setFileMeta(file.id, {
              width,
              height,
              bytes
            })
          }

          // If the image dimensions exceed the limit, resize it
          if (
            image.width > uploadContextRef.current.limitDimension ||
            image.height > uploadContextRef.current.limitDimension
          ) {
            const currentLimitDimension =
              uploadContextRef.current.limitDimension
            // Show a message that we're resizing
            uppy.info(
              `Redimensionando imagen de ${image.width}x${image.height} a ${currentLimitDimension}px máximo...`,
              "info",
              2000
            )

            // Resize the image
            const result = await resizeImage(file.data, {
              maxDimension: currentLimitDimension,
              quality: 0.85,
              maxCanvasSize: 4096 // Cap to prevent memory spikes
            })

            // Update the file with the resized blob
            // Preserve filename with appropriate fallback based on MIME type
            const fallbackName =
              result.blob.type === "image/png"
                ? "resized-image.png"
                : "resized-image.jpg"
            const resizedFile = new File(
              [result.blob],
              file.name ?? fallbackName,
              { type: result.blob.type }
            )

            // Update the Uppy file
            uppy.setFileState(file.id, {
              data: resizedFile,
              size: resizedFile.size
            })
            uppy.setFileMeta(file.id, {
              width: result.width,
              height: result.height,
              bytes: resizedFile.size
            })

            // Log the resize for monitoring
            Sentry.captureMessage("Image auto-resized", {
              level: "info",
              tags: { section: "file-upload" },
              extra: {
                originalWidth: image.width,
                originalHeight: image.height,
                newWidth: result.width,
                newHeight: result.height,
                limitDimension: currentLimitDimension
              }
            })
          }
        } catch (error) {
          console.error("Error processing image:", error)
          Sentry.captureException(error, {
            tags: { section: "file-upload" },
            extra: { stage: "resize" }
          })
          uppy.info("Error al procesar la imagen", "error", 3000)
          uppy.removeFile(file.id)
        }
      } else {
        // If the file is not an image, show an error
        console.error("Not an image")
        Sentry.captureMessage("Non-image file attempted upload", {
          level: "warning",
          tags: { section: "file-upload" },
          extra: { fileType: file.type }
        })
        uppy.info("El archivo no es una imagen", "error", 3000)
        uppy.removeFile(file.id)
      }
    }
    const handleUploadError: UppyEventMap<
      UploadFileMeta,
      Body
    >["upload-error"] = (file, error, response) => {
      const status = getHttpStatus(error, response)

      if (status === 403) {
        uppy.info("Esta función requiere el plan Pro", "error", 4000)
        if (file) uppy.removeFile(file.id)
        uploadContextRef.current.onUpgradeRequired?.()
        return
      }

      console.error("Upload error:", error)
      Sentry.captureException(error, {
        tags: { section: "file-upload" },
        extra: {
          imageType: uploadContextRef.current.imageType,
          objectId: uploadContextRef.current.objectId,
          status
        }
      })

      if (uploadContextRef.current.onUploadError) {
        uploadContextRef.current.onUploadError(
          error instanceof Error
            ? error
            : new Error("No se pudo subir el archivo")
        )
      }
    }
    const handleComplete = (result: UploadResult<UploadFileMeta, Body>) => {
      if (hasSuccessfulUpload(result)) {
        uploadContextRef.current.onUploadSuccess(result)
      }
    }

    uppy.on("file-added", handleFileAdded)
    uppy.on("upload-error", handleUploadError)
    uppy.on("complete", handleComplete)

    return () => {
      uppy.off("file-added", handleFileAdded)
      uppy.off("upload-error", handleUploadError)
      uppy.off("complete", handleComplete)
    }
  }, [uppy])

  useEffect(() => {
    if (destroyTimerRef.current) clearTimeout(destroyTimerRef.current)

    return () => {
      // Delay destruction so React Strict Mode's effect replay can retain the instance.
      destroyTimerRef.current = setTimeout(() => uppy.destroy(), 0)
    }
  }, [uppy])

  return (
    <Dashboard
      className="mx-auto max-w-[320px] sm:max-w-[520px]"
      uppy={uppy}
      waitForThumbnailsBeforeUpload
      proudlyDisplayPoweredByUppy={false}
      theme={theme === "dark" ? "dark" : theme === "system" ? "auto" : "light"}
      fileManagerSelectionType="files"
    />
  )
}

function getImageDimensions(
  imageData: Blob
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(imageData)
    const img = new Image()
    img.onload = function () {
      URL.revokeObjectURL(url)
      resolve({
        width: img.width,
        height: img.height
      })
    }
    img.onerror = function () {
      URL.revokeObjectURL(url)
      reject(new Error("Unable to read image dimensions"))
    }
    img.src = url
  })
}
