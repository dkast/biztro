import React from "react"
import { useNode } from "@craftjs/core"

import ToolboxPanel from "@/components/editor/ToolboxPanel"

const TextSettings = () => {
  const {
    actions: { setProp },
    propValue
  } = useNode(node => ({
    propValue: node.data.props["textAlign"]
  }))

  return (
    <ToolboxPanel title="Texto">
      <input
        type="text"
        defaultValue={propValue}
        onChange={e => setProp(props => (props.textAlign = e.target.value))}
      />
    </ToolboxPanel>
  )
}

export default TextSettings
