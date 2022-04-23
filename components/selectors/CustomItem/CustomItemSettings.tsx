import React from "react"
import { useNode } from "@craftjs/core"

import ToolboxPanel from "@/components/editor/ToolboxPanel"
import ToolboxItem from "@/components/editor/ToolboxItem"
import {
  ToolbarSelect,
  ToolbarSelectItem
} from "@/components/editor/ToolbarSelect"

const CustomItemSettings = (): JSX.Element => {
  const {
    actions: { setProp },
    layout
  } = useNode(node => ({
    layout: node.data.props.layout
  }))

  return (
    <ToolboxPanel title="Producto">
      <ToolboxItem label="Plantilla">
        <ToolbarSelect
          defaultValue={layout}
          onValueChange={value => setProp(props => (props.layout = value))}
        >
          <ToolbarSelectItem value="default">Default</ToolbarSelectItem>
          <ToolbarSelectItem value="image">Con Imagen</ToolbarSelectItem>
          <ToolbarSelectItem value="center">Centrado</ToolbarSelectItem>
        </ToolbarSelect>
      </ToolboxItem>
    </ToolboxPanel>
  )
}

export default CustomItemSettings
