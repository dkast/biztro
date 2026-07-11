import { useNode } from "@craftjs/core"
import { rgbaToHex, type RgbaColor } from "@uiw/react-color"

import ContainerSettings from "@/components/menu-editor/blocks/container-settings"
import { cn, isColorDark } from "@/lib/utils"

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

  const isDarkTheme = isColorDark(
    backgroundColor ? rgbaToHex(backgroundColor) : "#ffffff"
  )
  const overlayClass = isDarkTheme
    ? "bg-gradient-to-b from-black/30 to-black/80"
    : "bg-gradient-to-b from-white/20 via-transparent to-white/60"

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
          <div className={cn("absolute inset-0", overlayClass)}></div>
        )}
      </div>
      <main className="mx-auto flex max-w-(--breakpoint-md) grow flex-col">
        <div className="relative flex grow flex-col pb-8">{children}</div>
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
