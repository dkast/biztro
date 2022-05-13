import React from "react"
import { useEditor, useNode, UserComponent } from "@craftjs/core"
import ContentEditable from "react-contenteditable"

import TextSettings from "@/components/selectors/Text/TextSettings"
import Font from "@/components/Font"

interface TextProps {
  fontSize?: string
  textAlign?: string
  fontWeight?: string
  fontFamily?: string
  color?: Record<"r" | "g" | "b" | "a", number>
  text: string
}

const Text: UserComponent<TextProps> = ({
  fontSize,
  textAlign,
  fontWeight,
  fontFamily,
  color,
  text
}) => {
  const {
    connectors: { connect },
    actions: { setProp }
  } = useNode()
  const { enabled } = useEditor(state => ({
    enabled: state.options.enabled
  }))

  return (
    <Font family={fontFamily}>
      <ContentEditable
        disabled={!enabled}
        innerRef={connect}
        html={text}
        onChange={e => {
          setProp(prop => (prop.text = e.target.value), 500)
        }}
        tagName="h2"
        style={{
          fontSize: `${fontSize}px`,
          color: `rgba(${Object.values(color)})`,
          fontWeight,
          textAlign,
          outline: "none"
        }}
        className="px-4"
      />
    </Font>
  )
}

Text.craft = {
  displayName: "Encabezado",
  props: {
    fontSize: "12",
    color: { r: 38, g: 50, b: 56, a: 1 },
    fontWeight: "400",
    fontFamily: "Inter",
    textAlign: "left",
    text: "Encabezado"
  },
  related: {
    toolbar: TextSettings
  }
}

export default Text
