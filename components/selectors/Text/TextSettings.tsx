import React from "react"
import { useNode } from "@craftjs/core"
import {
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon
} from "@radix-ui/react-icons"
import { SketchPicker } from "react-color"

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

const TextSettings = () => {
  const {
    actions: { setProp },
    textAlign,
    fontWeight,
    color,
    fontSize
  } = useNode(node => ({
    textAlign: node.data.props.textAlign,
    fontWeight: node.data.props.fontWeight,
    color: node.data.props.color,
    fontSize: node.data.props.fontSize
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
      <div className="flex items-center justify-around px-2">
        <span className="w-1/3 text-sm">Alinea</span>
        <div className="w-2/3">
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
        </div>
      </div>
      <div className="flex items-center justify-around px-2">
        <span className="w-1/3 text-sm">Color</span>
        <div className="w-2/3">
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
              <SketchPicker
                color={color}
                onChange={color => {
                  setProp(props => (props.color = color.rgb))
                }}
              ></SketchPicker>
            </ToolbarPopoverContent>
          </ToolbarPopover>
        </div>
      </div>
      <div className="flex items-center justify-around px-2">
        <span className="w-1/3 text-sm">Tamaño</span>
        <div className="w-2/3">
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
        </div>
      </div>
    </ToolboxPanel>
  )
}

export default TextSettings
