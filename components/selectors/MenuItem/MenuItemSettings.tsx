import React from "react"
import { useNode } from "@craftjs/core"
import { SwatchesPicker } from "react-color"

import ToolboxPanel from "@/components/editor/ToolboxPanel"
import ToolbarItem from "@/components/editor/ToolbarItem"
import {
  ToolbarSelect,
  ToolbarSelectItem
} from "@/components/editor/ToolbarSelect"
import {
  ToolbarPopover,
  ToolbarPopoverContent,
  ToolbarPopoverTrigger
} from "@/components/editor/ToolbarPopover"

import { FONTS } from "@/lib/types"

const MenuItemSettings = (): JSX.Element => {
  const {
    actions: { setProp },
    layout,
    titleColor,
    textColor,
    fontFamily
  } = useNode(node => ({
    layout: node.data.props.layout,
    titleColor: node.data.props.titleColor,
    textColor: node.data.props.textColor,
    fontFamily: node.data.props.fontFamily
  }))

  return (
    <>
      <ToolboxPanel title="Producto">
        <ToolbarItem label="Plantilla">
          <ToolbarSelect
            defaultValue={layout}
            onValueChange={value => setProp(props => (props.layout = value))}
          >
            <ToolbarSelectItem value="default">Default</ToolbarSelectItem>
            <ToolbarSelectItem value="image">Con Imagen</ToolbarSelectItem>
            <ToolbarSelectItem value="center">Centrado</ToolbarSelectItem>
          </ToolbarSelect>
        </ToolbarItem>
      </ToolboxPanel>
      <ToolboxPanel title="Color">
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
      <ToolboxPanel title="Texto">
        <ToolbarItem label="Fuente">
          <ToolbarSelect
            defaultValue={fontFamily}
            onValueChange={value =>
              setProp(props => (props.fontFamily = value))
            }
          >
            {FONTS.map(font => (
              <ToolbarSelectItem key={font} value={font}>
                {font}
              </ToolbarSelectItem>
            ))}
          </ToolbarSelect>
        </ToolbarItem>
      </ToolboxPanel>
    </>
  )
}

export default MenuItemSettings
