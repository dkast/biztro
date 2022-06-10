import React from "react"
import { useEditor } from "@craftjs/core"
import { useLayer } from "@craftjs/layers"

import { DefaultLayerHeader } from "./DefaultLayerHeader"
import classNames from "@/lib/classnames"

export const DefaultLayer: React.FC = ({ children }) => {
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

  return (
    <div
      ref={layer}
      className={classNames(
        hovered ? "bg-gray-100" : "bg-transparent",
        hasChildCanvases && expanded ? "pb-1" : "pb-0",
        "mx-1 block rounded-lg"
      )}
    >
      <DefaultLayerHeader />
      {children ? (
        <div
          className={classNames(
            hasChildCanvases ? "ml-9 bg-gray-50" : "m-0 bg-transparent",
            "craft-layer-children relative"
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}
