import React, { useEffect } from "react"
import AwsS3, { type AwsS3UploadParameters } from "@uppy/aws-s3"
import Compressor from "@uppy/compressor"
import Uppy, { type UploadResult, type UppyFile } from "@uppy/core"
import ImageEditor from "@uppy/image-editor"
// @ts-expect-error - Uppy doesn't have types for this locale
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

export async function getUploadParameters(
  file: UppyFile,
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

const uppy = new Uppy({
  autoProceed: false,
  restrictions: {
    maxNumberOfFiles: 1,
    allowedFileTypes: [".jpg", ".jpeg", ".png"]
  },
  locale: Spanish
})
  .use(AwsS3)
  // .use(Webcam, {
  //   modes: ["picture"]
  // })
  .use(ImageEditor, {
    quality: 0.8
  })
  .use(Compressor, {
    locale: {
      strings: {
        // Shown in the Status Bar
        compressingImages: "Optimizando imágenes...",
        compressedX: "Ahorro de %{size} al optimizar imágenes"
      }
    }
  })

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
  onUploadSuccess: (result: UploadResult) => void
  limitDimension?: number
}) {
  const { theme } = useTheme()
  useEffect(() => {
    const awsS3Plugin = uppy.getPlugin("AwsS3")
    if (awsS3Plugin) {
      awsS3Plugin.setOptions({
        getUploadParameters: (file: UppyFile) =>
          getUploadParameters(file, organizationId, imageType, objectId)
      })
    }
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
            5000
          )
          uppy.removeFile(file.id)
        }
      } else {
        // If the file is not an image, show an error
        console.error("Not an image")
        uppy.info("El archivo no es una imagen", "error", 5000)
        uppy.removeFile(file.id)
      }
    })
    uppy.on("complete", result => {
      onUploadSuccess(result)
    })
  }, [imageType, objectId, onUploadSuccess, organizationId, limitDimension])
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
  imgFile: UppyFile
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
