import { useNode } from "@craftjs/core"
import type { RgbaColor } from "@uiw/react-color"

import ContainerSettings from "@/components/menu-editor/blocks/container-settings"

export type ContainerBlockProps = {
  backgroundColor?: RgbaColor
  color?: RgbaColor
  children?: React.ReactNode
}

export default function ContainerBlock({
  backgroundColor,
  color,
  children
}: ContainerBlockProps) {
  const {
    connectors: { connect }
  } = useNode()

  return (
    <div
      className="w-full grow pb-4"
      ref={ref => {
        if (ref) {
          connect(ref)
        }
      }}
      style={{
        backgroundColor: `rgb(${Object.values(backgroundColor ?? { r: 255, g: 255, b: 255, a: 1 })})`,
        color: `rgb(${Object.values(color ?? { r: 128, g: 128, b: 128, a: 1 })})`
      }}
    >
      <main className="mx-auto flex h-full max-w-screen-md flex-col">
        {children}
      </main>
    </div>
  )
}

ContainerBlock.craft = {
  displayName: "Sitio",
  props: {
    backgroundColor: { r: 255, g: 255, b: 255, a: 1 },
    color: { r: 100, g: 100, b: 100, a: 1 }
  },
  related: {
    settings: ContainerSettings
  }
}
