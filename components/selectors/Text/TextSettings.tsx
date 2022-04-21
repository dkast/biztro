import React from "react"
import { useNode } from "@craftjs/core"

import ToolboxPanel from "@/components/editor/ToolboxPanel"
import {
  ToolbarSelect,
  ToolbarSelectItem
} from "@/components/editor/ToolbarSelect"

const TextSettings = () => {
  const {
    actions: { setProp },
    textAlign,
    fontWeight
  } = useNode(node => ({
    textAlign: node.data.props.textAlign,
    fontWeight: node.data.props.fontWeight
  }))

  return (
    <ToolboxPanel title="Texto">
      <div className="flex items-center justify-around px-2">
        <span className="w-1/3 text-sm">Estilo</span>
        <div className="w-2/3">
          <ToolbarSelect
            defaultValue={fontWeight}
            onValueChange={value =>
              setProp(props => (props.fontWeight = value))
            }
          >
            <ToolbarSelectItem value="200">Light</ToolbarSelectItem>
            <ToolbarSelectItem value="400">Regular</ToolbarSelectItem>
            <ToolbarSelectItem value="600">Bold</ToolbarSelectItem>
          </ToolbarSelect>
        </div>
      </div>
    </ToolboxPanel>
  )
}

export default TextSettings
