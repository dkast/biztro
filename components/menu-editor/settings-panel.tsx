import React from "react"
import { useEditor } from "@craftjs/core"

import SideSection from "@/components/menu-editor/side-section"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable"

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
    // <ResizablePanelGroup direction="vertical">
    //   <ResizablePanel defaultSize={50} minSize={50} maxSize={70}>
    //     {active && related?.settings && React.createElement(related.settings)}
    //     {!active && (
    //       <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
    //         <span className="text-sm text-gray-500">
    //           Selecciona un componente para editar
    //         </span>
    //       </div>
    //     )}
    //   </ResizablePanel>
    //   <ResizableHandle />
    //   <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
    //     <SideSection title="Estructura"></SideSection>
    //   </ResizablePanel>
    // </ResizablePanelGroup>
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
