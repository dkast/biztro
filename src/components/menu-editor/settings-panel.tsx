import React from "react"
import { useEditor } from "@craftjs/core"

export default function SettingsPanel() {
  const { active, related } = useEditor((state, query) => {
    const currentlySelectedNodeId = query.getEvent("selected").first()
    return {
      active: currentlySelectedNodeId,
      related:
        currentlySelectedNodeId && state.nodes[currentlySelectedNodeId]?.related
    }
  })

  return (
    <>
      {active && related?.settings && React.createElement(related.settings)}
      {!active && (
        <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
          <span className="text-sm text-gray-500">
            Selecciona un componente para editar
          </span>
        </div>
      )}
    </>
  )
}