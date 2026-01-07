import ContentEditable from "react-contenteditable"
import { useEditor, useNode } from "@craftjs/core"
import type { RgbaColor } from "@uiw/react-color"

import HeadingSettings from "@/components/menu-editor/blocks/heading-settings"
import FontWrapper from "@/components/menu-editor/font-wrapper"

export type HeadingElementProps = {
  fontSize?: number
  textAlign?: string
  fontWeight?: string
  fontFamily?: string
  color?: RgbaColor
  text: string
}

export default function HeadingElement({
  fontSize,
  textAlign,
  fontWeight,
  fontFamily,
  color,
  text
}: HeadingElementProps) {
  const {
    connectors: { connect },
    actions: { setProp }
  } = useNode()

  const { enabled } = useEditor(state => ({
    enabled: state.options.enabled
  }))

  return (
    <FontWrapper fontFamily={fontFamily}>
      <ContentEditable
        disabled={!enabled}
        innerRef={connect}
        html={text}
        onChange={e => {
          setProp(
            (prop: HeadingElementProps) => (prop.text = e.target.value),
            500
          )
        }}
        tagName="h2"
        id={useNode().id}
        style={{
          fontSize: `${fontSize}px`,
          color: `rgba(${Object.values(color ?? { r: 0, g: 0, b: 0, a: 1 })}`,
          fontWeight,
          textAlign
        }}
        className="col-span-1 px-4 py-2 md:col-span-2"
      />
    </FontWrapper>
  )
}

HeadingElement.craft = {
  displayName: "Encabezado",
  props: {
    fontSize: 20,
    color: { r: 38, g: 50, b: 56, a: 1 },
    textAlign: "center",
    fontWeight: "700",
    fontFamily: "Inter",
    text: "Encabezado"
  },
  custom: {
    iconKey: "heading"
  },
  related: {
    settings: HeadingSettings
  }
}
