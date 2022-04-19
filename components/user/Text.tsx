import React from "react"
import { useNode, UserComponent } from "@craftjs/core"

interface TextProps {
  text: string
}

const Text: UserComponent<TextProps> = ({ text }) => {
  const {
    connectors: { connect, drag }
  } = useNode()

  return (
    <div ref={ref => connect(drag(ref))}>
      <p>{text}</p>
    </div>
  )
}

export default Text
