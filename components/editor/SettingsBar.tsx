import React from "react"
import { useEditor } from "@craftjs/core"
import { Layers } from "@craftjs/layers"
import ToolboxPanel from "./ToolboxPanel"

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
    <div className="flex flex-1 flex-col gap-4">
      {active && related.toolbar && React.createElement(related.toolbar)}
      {!active && (
        <div className="flex flex-col items-center justify-center px-5 py-2 text-center">
          <span className="text-sm text-gray-500">
            Selecciona un componente para editar
          </span>
        </div>
      )}
      <ToolboxPanel title="Estructura">
        <div className="-m-2">
          <Layers />
        </div>
      </ToolboxPanel>
    </div>
  )
}

export default SettingsBar
