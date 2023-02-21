import { useNode } from "@craftjs/core"
import React from "react"
import { SketchPicker } from "react-color"

import ToolbarItem from "@/components/editor/ToolbarItem"
import {
  ToolbarPopover,
  ToolbarPopoverContent,
  ToolbarPopoverTrigger
} from "@/components/editor/ToolbarPopover"
import ToolboxPanel from "@/components/editor/ToolboxPanel"

import { COLORS } from "@/lib/types"

const ContainerSettings = (): JSX.Element => {
  const {
    actions: { setProp },
    background
  } = useNode(node => ({
    background: node.data.props.background
  }))

  return (
    <ToolboxPanel title="Sección">
      <ToolbarItem label="Fondo">
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
              disableAlpha
              presetColors={COLORS}
              color={background}
              onChange={color => {
                setProp(props => (props.background = color.rgb))
              }}
            ></SketchPicker>
          </ToolbarPopoverContent>
        </ToolbarPopover>
      </ToolbarItem>
    </ToolboxPanel>
  )
}

export default ContainerSettings
