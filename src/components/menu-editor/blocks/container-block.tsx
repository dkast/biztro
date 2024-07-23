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
      <main className="relative mx-auto flex max-w-screen-md grow flex-col @container">
        <div
          className="grow bg-cover bg-fixed bg-no-repeat group-[.editor-preview]:bg-contain @3xl:bg-[50%_auto]"
          style={{
            backgroundImage:
              backgroundImage === "none" || !backgroundImage?.startsWith("bg")
                ? "none"
                : `url(/bg/${backgroundImage})`,
            backgroundPosition: backgroundImage?.split("-")[1]
          }}
        >
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
