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
        backgroundImage:
          backgroundImage === "none" || backgroundImage?.startsWith("bg")
            ? "none"
            : `url(/bg/${backgroundImage})`
      }}
    >
      <div
        // className="grow bg-cover bg-fixed bg-no-repeat group-[.editor-preview]:bg-contain @3xl:bg-[50%_auto]"
        className="fixed inset-0 mx-auto h-screen w-screen
          max-w-(--breakpoint-md) bg-cover bg-no-repeat
          group-[.editor-preview]:absolute group-[.editor-preview]:w-full"
        style={{
          backgroundImage:
            backgroundImage === "none" || !backgroundImage?.startsWith("bg")
              ? "none"
              : `url(/bg/${backgroundImage})`,
          backgroundPosition: backgroundImage?.split("-")[1]
        }}
      >
        {backgroundImage?.startsWith("bg") && (
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
