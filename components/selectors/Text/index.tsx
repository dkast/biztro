import React from "react"
import { useNode, UserComponent } from "@craftjs/core"
import ContentEditable from "react-contenteditable"

import TextSettings from "@/components/selectors/Text/TextSettings"

interface TextProps {
  fontSize?: string
  textAlign?: string
  fontWeight?: string
  color?: Record<"r" | "g" | "b" | "a", number>
  text: string
}

const Text: UserComponent<TextProps> = ({
  fontSize,
  textAlign,
  fontWeight,
  color,
  text
}) => {
  const {
    connectors: { connect },
    actions: { setProp }
  } = useNode()

  return (
    <ContentEditable
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
    />
  )
}

Text.craft = {
  displayName: "Encabezado",
  props: {
    fontSize: "12",
    color: { r: 92, g: 90, b: 90, a: 1 },
    fontWeight: "400",
    textAlign: "left",
    text: "Encabezado"
  },
  related: {
    toolbar: TextSettings
  }
}

export default Text
