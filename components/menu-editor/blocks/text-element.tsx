import ContentEditable from "react-contenteditable"
import { useEditor, useNode } from "@craftjs/core"

import TextSettings from "@/components/menu-editor/blocks/text-settings"

export type TextElementProps = {
  fontSize?: number
  textAlign?: string
  fontWeight?: string
  fontFamily?: string
  color?: Record<"r" | "g" | "b" | "a", number>
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
    <ContentEditable
      disabled={!enabled}
      innerRef={connect}
      html={text}
      onChange={e => {
        setProp((prop: TextElementProps) => (prop.text = e.target.value), 500)
      }}
      tagName="span"
      style={{
        fontSize: `${fontSize}px`,
        color: `rgba(${Object.values(color ?? { r: 0, g: 0, b: 0, a: 1 })}`,
        fontWeight,
        textAlign,
        outline: "none"
      }}
      className="px-4 py-2"
    />
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
