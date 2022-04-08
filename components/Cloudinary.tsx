/* eslint-disable */

import Head from "next/head"
import Script from "next/script"

import type { MouseEvent, ReactNode } from "react"
import type {
  CloudinaryCallbackImage,
  CloudinaryWidget,
  CloudinaryWidgetResult
} from "@/lib/types"

interface ChildrenProps {
  open: (e: MouseEvent) => void
}

interface CloudinaryUploadWidgetProps {
  callback: (image: CloudinaryCallbackImage) => void
  children: (props: ChildrenProps) => ReactNode
}

export default function CloudinaryUploadWidget({
  callback,
  children
}: CloudinaryUploadWidgetProps) {
  function showWidget() {
    const widget: CloudinaryWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_UPLOAD_PRESET,
        cropping: true
      },
      (error: unknown | undefined, result: CloudinaryWidgetResult) => {
        if (!error && result && result.event === "success") {
          callback(result.info)
        }
      }
    )

    widget.open()
  }

  function open(e: MouseEvent) {
    e.preventDefault()
    showWidget()
  }

  return (
    <>
      <Head>
        // this is Next.js specific, but if you're using something like Create
        // React App, you could download the script in componentDidMount using
        // this method: https://stackoverflow.com/a/34425083/1424568
        <script
          src="https://widget.cloudinary.com/v2.0/global/all.js"
          type="text/javascript"
        />
      </Head>
      {children({ open })}
    </>
  )
}
