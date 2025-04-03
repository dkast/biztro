import React, { useEffect, useRef } from "react"
import { useEditor } from "@craftjs/core"
import { useLayer } from "@craftjs/layers"

import LayerHeader from "@/components/menu-editor/layers/layer-header"
import { cn } from "@/lib/utils"

export default function DefaultLayer({
  children
}: {
  children: React.ReactNode
}) {
  const {
    id,
    expanded,
    hovered,
    connectors: { layer }
  } = useLayer(layer => ({
    hovered: layer.event.hovered,
    expanded: layer.expanded
  }))
  const { hasChildCanvases } = useEditor((state, query) => {
    return {
      hasChildCanvases: query.node(id).isParentOfTopLevelNodes()
    }
  })

  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (divRef.current) {
      layer(divRef.current)
    }
  }, [layer])

  return (
    <div
      ref={divRef}
      className={cn(
        hovered ? "bg-gray-100 dark:bg-gray-800/70" : "bg-transparent",
        hasChildCanvases && expanded ? "pb-1" : "pb-0",
        "editor-layers mx-2 mt-2 block rounded-sm"
      )}
    >
      <LayerHeader />
      {children ? (
        <div
          className={cn(
            hasChildCanvases
              ? "ml-9 bg-gray-50 dark:bg-gray-800/70"
              : "m-0 bg-transparent",
            "craft-layer-children relative"
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}
