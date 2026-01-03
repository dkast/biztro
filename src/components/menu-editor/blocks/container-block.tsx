import { useNode } from "@craftjs/core"
import type { RgbaColor } from "@uiw/react-color"

import ContainerSettings from "@/components/menu-editor/blocks/container-settings"

export type ContainerBlockProps = {
  backgroundColor?: RgbaColor
  backgroundImage?: string
  children?: React.ReactNode
}

export default function ContainerBlock({
  backgroundColor,
  backgroundImage,
  children
}: ContainerBlockProps) {
  const {
    connectors: { connect }
  } = useNode()

  // Determine background type:
  // - "none": no background image
  // - "bg-*": predefined photo background (e.g., bg-center, bg-top)
  // - "*.svg" or pattern names: SVG patterns from /bg/
  // - Contains "/" or starts with "http": uploaded image URL/storage key
  const isUploadedImage =
    backgroundImage &&
    backgroundImage !== "none" &&
    (backgroundImage.includes("/") || backgroundImage.startsWith("http"))
  const isPredefinedPhoto = backgroundImage?.startsWith("bg")
  const isPattern =
    backgroundImage &&
    backgroundImage !== "none" &&
    !isUploadedImage &&
    !isPredefinedPhoto

  // Build the background URL
  const getBackgroundUrl = () => {
    if (!backgroundImage || backgroundImage === "none") return "none"
    if (isUploadedImage) {
      // Full URL or storage key transformed to URL by server
      return `url(${backgroundImage})`
    }
    if (isPredefinedPhoto || isPattern) {
      return `url(/bg/${backgroundImage})`
    }
    return "none"
  }

  return (
    <div
      className="relative flex grow"
      ref={ref => {
        if (ref) {
          connect(ref)
        }
      }}
      style={{
        backgroundColor: `rgb(${Object.values(backgroundColor ?? { r: 255, g: 255, b: 255, a: 1 })})`,
        backgroundImage: isPattern ? getBackgroundUrl() : "none"
      }}
    >
      <div
        // className="grow bg-cover bg-fixed bg-no-repeat group-[.editor-preview]:bg-contain @3xl:bg-[50%_auto]"
        className="fixed inset-0 mx-auto h-screen w-screen
          max-w-(--breakpoint-md) bg-cover bg-no-repeat
          group-[.editor-preview]:absolute group-[.editor-preview]:w-full"
        style={{
          backgroundImage:
            isPredefinedPhoto || isUploadedImage ? getBackgroundUrl() : "none",
          backgroundPosition: isPredefinedPhoto
            ? backgroundImage?.split("-")[1]
            : "top"
        }}
      >
        {(isPredefinedPhoto || isUploadedImage) && (
          <div
            className="absolute inset-0 bg-linear-to-b from-black/20
              to-black/80"
          ></div>
        )}
      </div>
      <main
        className="@container mx-auto flex max-w-(--breakpoint-md) grow
          flex-col"
      >
        <div className="relative grid grow grid-cols-1 pb-8 md:grid-cols-2">
          {children}
        </div>
      </main>
    </div>
  )
}

ContainerBlock.craft = {
  displayName: "Sitio",
  props: {
    backgroundColor: { r: 255, g: 255, b: 255, a: 1 },
    backgroundImage: "none"
  },
  related: {
    settings: ContainerSettings
  }
}
