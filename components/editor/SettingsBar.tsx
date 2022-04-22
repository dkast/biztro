import React from "react"
import { useEditor } from "@craftjs/core"
import { Layers } from "@craftjs/layers"

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
    <div className="grid grid-rows-2 gap-4">
      {active && related.toolbar && React.createElement(related.toolbar)}
      {!active && (
        <div className="flex h-full flex-col items-center justify-center px-5 py-2 text-center">
          <span className="text-sm text-gray-500">
            Selecciona un componente para editar
          </span>
        </div>
      )}
      <div className="border-t">
        <Layers />
      </div>
    </div>
  )
}

export default SettingsBar
