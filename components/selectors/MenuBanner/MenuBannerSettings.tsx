import React from "react"
import { useNode } from "@craftjs/core"
import { SwatchesPicker } from "react-color"

import ToolboxPanel from "@/components/editor/ToolboxPanel"
import ToolbarItem from "@/components/editor/ToolbarItem"
import {
  ToolbarPopover,
  ToolbarPopoverContent,
  ToolbarPopoverTrigger
} from "@/components/editor/ToolbarPopover"

const MenuBannerSettings = (): JSX.Element => {
  const {
    actions: { setProp },
    titleColor,
    textColor
  } = useNode(node => ({
    titleColor: node.data.props.titleColor,
    textColor: node.data.props.textColor
  }))

  return (
    <ToolboxPanel title="Banner">
      <ToolbarItem label="Titulo">
        <ToolbarPopover>
          <ToolbarPopoverTrigger>
            <div
              className="h-5 w-12 rounded border border-black/10"
              style={{
                backgroundColor: `rgba(${Object.values(titleColor)})`
              }}
            ></div>
          </ToolbarPopoverTrigger>
          <ToolbarPopoverContent>
            <SwatchesPicker
              color={titleColor}
              onChange={color => {
                setProp(props => (props.titleColor = color.rgb))
              }}
            ></SwatchesPicker>
          </ToolbarPopoverContent>
        </ToolbarPopover>
      </ToolbarItem>
      <ToolbarItem label="Texto">
        <ToolbarPopover>
          <ToolbarPopoverTrigger>
            <div
              className="h-5 w-12 rounded border border-black/10"
              style={{
                backgroundColor: `rgba(${Object.values(textColor)})`
              }}
            ></div>
          </ToolbarPopoverTrigger>
          <ToolbarPopoverContent>
            <SwatchesPicker
              color={textColor}
              onChange={color => {
                setProp(props => (props.textColor = color.rgb))
              }}
            ></SwatchesPicker>
          </ToolbarPopoverContent>
        </ToolbarPopover>
      </ToolbarItem>
    </ToolboxPanel>
  )
}

export default MenuBannerSettings
