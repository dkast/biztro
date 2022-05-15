import React from "react"
import { useEditor } from "@craftjs/core"
import { Layers } from "@craftjs/layers"

import ToolboxPanel from "@/components/editor/ToolboxPanel"
import ToolbarScroll from "@/components/editor/ToolbarScroll"
import { DefaultLayer } from "@/components/editor/DefaultLayer"

const SettingsBar = (): JSX.Element => {
  const { active, related } = useEditor((state, query) => {
    const currentlySelectedNodeId = query.getEvent("selected").first()
    return {
      active: currentlySelectedNodeId,
      related:
        currentlySelectedNodeId && state.nodes[currentlySelectedNodeId].related
    }
  })
  return (
    <ToolbarScroll>
      <div className="grid w-full grid-cols-1 grid-rows-2">
        <div>
          {active && related.toolbar && React.createElement(related.toolbar)}
          {!active && (
            <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
              <span className="text-sm text-gray-500">
                Selecciona un componente para editar
              </span>
            </div>
          )}
        </div>
        <div>
          <ToolboxPanel title="Estructura">
            <div className="-m-2">
              <Layers renderLayer={DefaultLayer} />
            </div>
          </ToolboxPanel>
        </div>
      </div>
    </ToolbarScroll>
  )
}

export default SettingsBar
