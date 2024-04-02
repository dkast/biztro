import { useNode } from "@craftjs/core"
import type { RgbaColor } from "@uiw/react-color"

import ContainerSettings from "@/components/menu-editor/blocks/container-settings"

export type ContainerBlockProps = {
  backgroundColor?: RgbaColor
  children?: React.ReactNode
}

export default function ContainerBlock({
  backgroundColor,
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
        backgroundColor: `rgb(${Object.values(backgroundColor ?? { r: 255, g: 255, b: 255, a: 1 })})`
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
    backgroundColor: { r: 255, g: 255, b: 255, a: 1 }
  },
  related: {
    settings: ContainerSettings
  }
}
