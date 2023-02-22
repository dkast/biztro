import { useNode } from "@craftjs/core"
import React from "react"
import { SketchPicker } from "react-color"

import ToolbarItem from "@/components/editor/ToolbarItem"
import {
  ToolbarPopover,
  ToolbarPopoverContent,
  ToolbarPopoverTrigger
} from "@/components/editor/ToolbarPopover"
import {
  ToolbarSelect,
  ToolbarSelectItem
} from "@/components/editor/ToolbarSelect"
import ToolboxPanel from "@/components/editor/ToolboxPanel"

import { COLORS, FONTS } from "@/lib/types"

const MenuItemSettings = (): JSX.Element => {
  const {
    actions: { setProp },
    layout,
    titleColor,
    textColor,
    fontFamily,
    fontWeight
  } = useNode(node => ({
    layout: node.data.props.layout,
    titleColor: node.data.props.titleColor,
    textColor: node.data.props.textColor,
    fontFamily: node.data.props.fontFamily,
    fontWeight: node.data.props.fontWeight
  }))

  return (
    <>
      <ToolboxPanel title="Producto">
        <ToolbarItem label="Plantilla">
          <ToolbarSelect
            value={layout}
            onValueChange={value => setProp(props => (props.layout = value))}
          >
            <ToolbarSelectItem value="default">Default</ToolbarSelectItem>
            <ToolbarSelectItem value="image">Con Imagen</ToolbarSelectItem>
            <ToolbarSelectItem value="center">Centrado</ToolbarSelectItem>
          </ToolbarSelect>
        </ToolbarItem>
      </ToolboxPanel>
      <ToolboxPanel title="Titulo">
        <ToolbarItem label="Fuente">
          <ToolbarSelect
            value={fontFamily}
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
        <ToolbarItem label="Estilo">
          <ToolbarSelect
            value={fontWeight}
            onValueChange={value =>
              setProp(props => (props.fontWeight = value))
            }
          >
            <ToolbarSelectItem value="200">Light</ToolbarSelectItem>
            <ToolbarSelectItem value="400">Regular</ToolbarSelectItem>
            <ToolbarSelectItem value="600">Bold</ToolbarSelectItem>
          </ToolbarSelect>
        </ToolbarItem>
        <ToolbarItem label="Color">
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
              <SketchPicker
                disableAlpha
                presetColors={COLORS}
                color={titleColor}
                onChange={color => {
                  setProp(props => (props.titleColor = color.rgb))
                }}
              ></SketchPicker>
            </ToolbarPopoverContent>
          </ToolbarPopover>
        </ToolbarItem>
      </ToolboxPanel>
      <ToolboxPanel title="Descripcion">
        <ToolbarItem label="Color">
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
              <SketchPicker
                disableAlpha
                presetColors={COLORS}
                color={textColor}
                onChange={color => {
                  setProp(props => (props.textColor = color.rgb))
                }}
              ></SketchPicker>
            </ToolbarPopoverContent>
          </ToolbarPopover>
        </ToolbarItem>
      </ToolboxPanel>
    </>
  )
}

export default MenuItemSettings
