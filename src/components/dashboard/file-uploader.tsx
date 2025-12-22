import React, { useCallback, useEffect, useState } from "react"
import AwsS3, { type AwsS3UploadParameters } from "@uppy/aws-s3"
import Compressor from "@uppy/compressor"
import Uppy, {
  type Body,
  type Meta,
  type UploadResult,
  type UppyFile
} from "@uppy/core"
import ImageEditor from "@uppy/image-editor"
import Spanish from "@uppy/locales/lib/es_MX"
import Dashboard from "@uppy/react/dashboard"

// Uppy styles
import "@uppy/core/dist/style.min.css"
import "@uppy/dashboard/dist/style.min.css"
import "@uppy/image-editor/dist/style.min.css"

// import "@uppy/webcam/dist/style.min.css"

// import Webcam from "@uppy/webcam"
import { useTheme } from "next-themes"

import type { ImageType } from "@/lib/types"

export async function getUploadParameters(
  file: UppyFile<Meta, Body>,
  organizationId: string,
  imageType: ImageType,
  objectId: string
) {
  const response = await fetch("/api/file", {
    method: "POST",
    headers: {
      accept: "application/json"
    },
    body: JSON.stringify({
      organizationId,
      imageType,
      objectId,
      filename: file.name,
      contentType: file.type
    })
  })
  if (!response.ok) throw new Error("Unsuccessful request")

  // Parse the JSON response.

  const data: { url: string; method: "PUT" } = await response.json()

  // Return an object in the correct shape.
  const object: AwsS3UploadParameters = {
    method: data.method,
    url: data.url,
    fields: {}, // For presigned PUT uploads, this should be left empty.
    // Provide content type header required by S3
    headers: {
      "Content-Type": file.type ? file.type : "application/octet-stream"
    }
  }
  return object
}

export function FileUploader({
  organizationId,
  imageType,
  objectId,
  onUploadSuccess,
  limitDimension = 1200
}: {
  organizationId: string
  imageType: ImageType
  objectId: string
  onUploadSuccess: (result: UploadResult<Meta, Body>) => void
  limitDimension?: number
}) {
  const { theme } = useTheme()

  const [uppy] = useState(() =>
    new Uppy({
      autoProceed: false,
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: [".jpg", ".jpeg", ".png"]
      },
      locale: Spanish
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: (file: UppyFile<Meta, Body>) =>
          getUploadParameters(file, organizationId, imageType, objectId)
      })
      .use(ImageEditor, {
        quality: 0.8
      })
      .use(Compressor, {
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
  )

  const handleFileAdded = useCallback(
    async (file: UppyFile<Meta, Body>) => {
      // If the file is an image, get the dimensions
      if (file.type?.startsWith("image/")) {
        // console.log("Loading image")
        try {
          const image = await getImageDimensions(file)
          // console.log(image.width, image.height)

          // If the image dimensions are too big, show an error
          if (
            (image.width as number) > limitDimension ||
            (image.height as number) > limitDimension
          ) {
            console.error("Image too big")
            uppy.info(
              `La imagen es demasiado grande, el tamaño máximo es de ${limitDimension}x${limitDimension} píxeles`,
              "error",
              3000
            )
            uppy.removeFile(file.id)
          }
        } catch (error) {
          console.error("Error loading image dimensions:", error)
          uppy.info("Error al cargar la imagen", "error", 3000)
          uppy.removeFile(file.id)
        }
      } else {
        // If the file is not an image, show an error
        console.error("Not an image")
        uppy.info("El archivo no es una imagen", "error", 3000)
        uppy.removeFile(file.id)
      }
    },
    [uppy, limitDimension]
  )

  useEffect(() => {
    uppy.on("file-added", handleFileAdded)
    uppy.on("complete", onUploadSuccess)

    return () => {
      uppy.off("file-added", handleFileAdded)
      uppy.off("complete", onUploadSuccess)
      uppy.destroy()
    }
  }, [uppy, handleFileAdded, onUploadSuccess])

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
  imgFile: UppyFile<Meta, Body>
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (!imgFile.data) {
      reject(new Error("File data is not available"))
      return
    }
    // Check if data is actually a Blob or File (not just an object with size)
    if (!(imgFile.data instanceof Blob) && !(imgFile.data instanceof File)) {
      reject(new Error("File data is not a valid Blob or File"))
      return
    }
    const url = URL.createObjectURL(imgFile.data)
    const img = new Image()
    img.onload = function () {
      URL.revokeObjectURL(img.src)
      resolve({
        width: img.width,
        height: img.height
      })
    }
    img.onerror = function () {
      URL.revokeObjectURL(img.src)
      reject(new Error("Failed to load image"))
    }
    img.src = url
  })
}
