import React from "react"
import { useEditor } from "@craftjs/core"

import ToolboxPanel from "@/components/editor/ToolboxPanel"

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
    <>
      {active && related.toolbar && React.createElement(related.toolbar)}
      {!active && (
        <div className="flex h-full flex-col items-center justify-center px-5 py-2 text-center">
          <span className="text-sm text-gray-500">
            Selecciona un componente para editar
          </span>
        </div>
      )}
    </>
  )
}

export default SettingsBar
