import ContentEditable from "react-contenteditable"
import { useEditor, useNode } from "@craftjs/core"
import type { RgbaColor } from "@uiw/react-color"

import TextSettings from "@/components/menu-editor/blocks/text-settings"
import FontWrapper from "@/components/menu-editor/font-wrapper"

export type TextElementProps = {
  fontSize?: number
  textAlign?: string
  fontWeight?: string
  fontFamily?: string
  color?: RgbaColor
  text: string
}

export default function TextElement({
  fontSize,
  textAlign,
  fontWeight,
  fontFamily,
  color,
  text
}: TextElementProps) {
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
          setProp((prop: TextElementProps) => (prop.text = e.target.value), 500)
        }}
        tagName="p"
        style={{
          fontSize: `${fontSize}px`,
          color: `rgba(${Object.values(color ?? { r: 0, g: 0, b: 0, a: 1 })}`,
          fontWeight,
          textAlign
        }}
        className="px-4 py-2"
      />
    </FontWrapper>
  )
}

TextElement.craft = {
  displayName: "Texto",
  props: {
    fontSize: 16,
    color: { r: 38, g: 50, b: 56, a: 1 },
    textAlign: "left",
    fontWeight: "400",
    fontFamily: "Inter",
    text: "Texto"
  },
  related: {
    settings: TextSettings
  }
}
