import React from "react"
import { useEditor } from "@craftjs/core"
import { Settings2 } from "lucide-react"

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
        <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center">
          <div className="rounded-full bg-lime-100 p-2 text-lime-600 dark:bg-green-900/70 dark:text-green-500">
            <Settings2 className="size-6" />
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Selecciona un componente para editar
          </span>
        </div>
      )}
    </>
  )
}
