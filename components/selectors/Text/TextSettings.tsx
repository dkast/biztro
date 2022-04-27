import React from "react"
import { useNode } from "@craftjs/core"
import {
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon
} from "@radix-ui/react-icons"
import { SwatchesPicker } from "react-color"

import ToolboxPanel from "@/components/editor/ToolboxPanel"
import {
  ToolbarSelect,
  ToolbarSelectItem
} from "@/components/editor/ToolbarSelect"
import {
  ToolbarToggleGroup,
  ToolbarToggleGroupItem
} from "@/components/editor/ToolbarToggleGroup"
import {
  ToolbarPopover,
  ToolbarPopoverContent,
  ToolbarPopoverTrigger
} from "@/components/editor/ToolbarPopover"
import ToolbarItem from "@/components/editor/ToolbarItem"

import { FONTS } from "@/lib/types"

const SIZES = [
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "16",
  "18",
  "20",
  "24",
  "30",
  "36",
  "40",
  "48",
  "60",
  "72",
  "96",
  "128"
]

const TextSettings = (): JSX.Element => {
  const {
    actions: { setProp },
    textAlign,
    fontWeight,
    color,
    fontSize,
    fontFamily
  } = useNode(node => ({
    textAlign: node.data.props.textAlign,
    fontWeight: node.data.props.fontWeight,
    color: node.data.props.color,
    fontSize: node.data.props.fontSize,
    fontFamily: node.data.props.fontFamily
  }))

  return (
    <ToolboxPanel title="Texto">
      <ToolbarItem label="Fuente">
        <ToolbarSelect
          defaultValue={fontFamily}
          onValueChange={value => setProp(props => (props.fontFamily = value))}
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
          defaultValue={fontWeight}
          onValueChange={value => setProp(props => (props.fontWeight = value))}
        >
          <ToolbarSelectItem value="200">Light</ToolbarSelectItem>
          <ToolbarSelectItem value="400">Regular</ToolbarSelectItem>
          <ToolbarSelectItem value="600">Bold</ToolbarSelectItem>
        </ToolbarSelect>
      </ToolbarItem>
      <ToolbarItem label="Alinea">
        <ToolbarToggleGroup
          type="single"
          value={textAlign}
          onValueChange={value => {
            setProp(props => (props.textAlign = value))
          }}
        >
          <ToolbarToggleGroupItem value="left">
            <TextAlignLeftIcon />
          </ToolbarToggleGroupItem>
          <ToolbarToggleGroupItem value="center">
            <TextAlignCenterIcon />
          </ToolbarToggleGroupItem>
          <ToolbarToggleGroupItem value="right">
            <TextAlignRightIcon />
          </ToolbarToggleGroupItem>
        </ToolbarToggleGroup>
      </ToolbarItem>
      <ToolbarItem label="Color">
        <ToolbarPopover>
          <ToolbarPopoverTrigger>
            <div
              className="h-5 w-12 rounded border border-black/10"
              style={{
                backgroundColor: `rgba(${Object.values(color)})`
              }}
            ></div>
          </ToolbarPopoverTrigger>
          <ToolbarPopoverContent>
            <SwatchesPicker
              color={color}
              onChange={color => {
                setProp(props => (props.color = color.rgb))
              }}
            ></SwatchesPicker>
          </ToolbarPopoverContent>
        </ToolbarPopover>
      </ToolbarItem>
      <ToolbarItem label="Tamaño">
        <ToolbarSelect
          defaultValue={fontSize}
          onValueChange={value => setProp(props => (props.fontSize = value))}
        >
          {SIZES.map(size => (
            <ToolbarSelectItem key={size} value={size}>
              {size}
            </ToolbarSelectItem>
          ))}
        </ToolbarSelect>
      </ToolbarItem>
    </ToolboxPanel>
  )
}

export default TextSettings
