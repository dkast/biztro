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
  ToolbarSwitch,
  ToolbarSwitchThumb
} from "@/components/editor/ToolbarSwitch"
import ToolboxPanel from "@/components/editor/ToolboxPanel"

import { COLORS } from "@/lib/types"

const MenuBannerSettings = (): JSX.Element => {
  const {
    actions: { setProp },
    titleColor,
    textColor,
    showBanner,
    showLogo
  } = useNode(node => ({
    titleColor: node.data.props.titleColor,
    textColor: node.data.props.textColor,
    showBanner: node.data.props.showBanner,
    showLogo: node.data.props.showLogo
  }))

  return (
    <>
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
      <ToolboxPanel title="Imagenes">
        <ToolbarItem label="Banner">
          <ToolbarSwitch
            checked={showBanner}
            onCheckedChange={value =>
              setProp(props => (props.showBanner = value))
            }
          >
            <ToolbarSwitchThumb />
          </ToolbarSwitch>
        </ToolbarItem>
        <ToolbarItem label="Logo">
          <ToolbarSwitch
            checked={showLogo}
            onCheckedChange={value =>
              setProp(props => (props.showLogo = value))
            }
          >
            <ToolbarSwitchThumb />
          </ToolbarSwitch>
        </ToolbarItem>
      </ToolboxPanel>
    </>
  )
}

export default MenuBannerSettings
