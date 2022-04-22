import React from "react"
import { useNode } from "@craftjs/core"
import { SketchPicker } from "react-color"

import ToolboxPanel from "@/components/editor/ToolboxPanel"
import {
  ToolbarPopover,
  ToolbarPopoverContent,
  ToolbarPopoverTrigger
} from "@/components/editor/ToolbarPopover"
import ToolboxItem from "@/components/editor/ToolboxItem"

const ContainerSettings = (): JSX.Element => {
  const {
    actions: { setProp },
    background
  } = useNode(node => ({
    background: node.data.props.background
  }))

  return (
    <ToolboxPanel title="Sección">
      <ToolboxItem label="Fondo">
        <ToolbarPopover>
          <ToolbarPopoverTrigger>
            <div
              className="h-5 w-12 rounded border border-black/10"
              style={{
                backgroundColor: `rgba(${Object.values(background)})`
              }}
            ></div>
          </ToolbarPopoverTrigger>
          <ToolbarPopoverContent>
            <SketchPicker
              color={background}
              onChange={color => {
                setProp(props => (props.background = color.rgb))
              }}
            ></SketchPicker>
          </ToolbarPopoverContent>
        </ToolbarPopover>
      </ToolboxItem>
    </ToolboxPanel>
  )
}

export default ContainerSettings
