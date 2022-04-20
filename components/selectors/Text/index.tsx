import React from "react"
import { useNode, UserComponent } from "@craftjs/core"
import ContentEditable from "react-contenteditable"

import TextSettings from "@/components/selectors/Text/TextSettings"

interface TextProps {
  fontSize?: string
  textAlign?: string
  fontWeight?: string
  color?: any
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
    setProp
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
        color: `rgba(${Object.values(color)})`,
        fontWeight,
        textAlign
      }}
      className="text-xl sm:text-2xl"
    />
  )
}

Text.craft = {
  displayName: "Encabezado",
  props: {
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
