import React, { useEffect, useState } from "react"
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
import { Dashboard } from "@uppy/react"

// Uppy styles
import "@uppy/core/dist/style.min.css"
import "@uppy/dashboard/dist/style.min.css"
import "@uppy/image-editor/dist/style.min.css"

// import "@uppy/webcam/dist/style.min.css"

// import Webcam from "@uppy/webcam"
import { useTheme } from "next-themes"

import type { ImageType } from "@/lib/types"

// Explicit types for richer error and file meta handling
interface HttpError extends Error {
  status: number
}

interface UploadFileMeta extends Meta {
  storageKey?: string
  [key: string]: unknown
}

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
  if (!response.ok) {
    const error = new Error("Unsuccessful request") as HttpError
    // Attach status code to the error object so it can be checked later
    error.status = response.status
    throw error
  }

  // Parse the JSON response.

  const raw = await response.json()
  const url = typeof raw?.url === "string" ? raw.url : ""
  const method = typeof raw?.method === "string" ? (raw.method as "PUT") : "PUT"
  const storageKey =
    typeof raw?.storageKey === "string" ? raw.storageKey : undefined

  // Return an object in the correct shape.
  const object: AwsS3UploadParameters = {
    method,
    url,
    fields: {}, // For presigned PUT uploads, this should be left empty.
    // Provide content type header required by S3
    headers: {
      "Content-Type": file.type ? file.type : "application/octet-stream"
    }
  }

  // Store the storageKey (if supplied by server) in the file meta so we can
  // later access it in the `complete` handler.
  if (storageKey) {
    // mutate meta safely
    const meta = file.meta as UploadFileMeta
    meta.storageKey = storageKey
  }

  return object
}

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

  const [uppy] = useState(() =>
    new Uppy({
      autoProceed: false,
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: [".jpg", ".jpeg", ".png"],
        maxFileSize: effectiveMaxFileSize
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

  useEffect(() => {
    uppy.on("file-added", async file => {
      // If the file is an image, get the dimensions
      if (file.type?.startsWith("image/")) {
        // console.log("Loading image")
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
      } else {
        // If the file is not an image, show an error
        console.error("Not an image")
        uppy.info("El archivo no es una imagen", "error", 3000)
        uppy.removeFile(file.id)
      }
    })
    uppy.on("upload-error", (file, error, response) => {
      // Guard against undefined file (Uppy may call this without a file)
      if (!file) return

      console.dir(error)

      // Extract status code from error object (attached in getUploadParameters)
      const status =
        error && typeof error === "object" && "status" in error
          ? (error as HttpError).status
          : undefined

      if (status === 403) {
        uppy.info("Esta función requiere el plan Pro", "error", 4000)
        uppy.removeFile(file.id)
        onUpgradeRequired?.()
        return
      }

      if (onUploadError) {
        onUploadError(
          error instanceof Error
            ? error
            : new Error("No se pudo subir el archivo")
        )
      }
    })
    uppy.on("complete", result => {
      console.log("Upload complete:", result)
      onUploadSuccess(result)
    })
  }, [
    uppy,
    imageType,
    objectId,
    onUploadSuccess,
    organizationId,
    limitDimension,
    onUploadError,
    onUpgradeRequired
  ])

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
  return new Promise(resolve => {
    const url = URL.createObjectURL(imgFile.data)
    const img = new Image()
    img.onload = function () {
      URL.revokeObjectURL(img.src)
      resolve({
        width: img.width,
        height: img.height
      })
    }
    img.src = url
  })
}
