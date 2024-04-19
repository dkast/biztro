"use client"

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
    maxNumberOfFiles: 1
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
  onUploadSuccess
}: {
  organizationId: string
  imageType: ImageType
  objectId: string
  onUploadSuccess: (result: UploadResult) => void
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
    uppy.on("complete", result => {
      onUploadSuccess(result)
    })
  }, [imageType, objectId, onUploadSuccess, organizationId])
  return (
    <Dashboard
      className="mx-auto max-w-[320px] sm:max-w-[520px]"
      uppy={uppy}
      waitForThumbnailsBeforeUpload
      proudlyDisplayPoweredByUppy={false}
      theme={theme === "dark" ? "dark" : theme === "system" ? "auto" : "light"}
    />
  )
}
