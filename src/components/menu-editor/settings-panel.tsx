import React from "react"
import { useEditor } from "@craftjs/core"
import { Mouse } from "lucide-react"

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
    <div className="editor-settings">
      {active && related?.settings && React.createElement(related.settings)}
      {!active && (
        <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center">
          <div className="rounded-full bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/70 dark:text-indigo-500">
            <Mouse className="size-6" />
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Selecciona un componente para editar
          </span>
        </div>
      )}
    </div>
  )
}
