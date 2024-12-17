import React, { useEffect, useRef } from "react"
import { useEditor } from "@craftjs/core"
import { useLayer } from "@craftjs/layers"
import { ChevronDown, ChevronUp, Eye, EyeOff, Link } from "lucide-react"

import { LayerName } from "@/components/menu-editor/layers/layer-name"
import { cn } from "@/lib/utils"

export default function LayerHeader() {
  const {
    id,
    expanded,
    children,
    connectors: { drag, layerHeader },
    actions: { toggleLayer }
  } = useLayer(layer => {
    return {
      expanded: layer.expanded
    }
  })

  const { hidden, actions, selected, topLevel } = useEditor((state, query) => {
    // TODO: handle multiple selected elements
    const selected = query.getEvent("selected").first() === id

    return {
      hidden: state.nodes[id]?.data.hidden,
      selected,
      topLevel: query.node(id).isTopLevelCanvas()
    }
  })

  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (divRef.current) {
      drag(divRef.current)
    }
  }, [drag])

  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (headerRef.current) {
      layerHeader(headerRef.current)
    }
  }, [layerHeader])

  return (
    <div
      ref={divRef}
      className={cn(
        selected
          ? "rounded bg-indigo-500 text-white dark:bg-indigo-600"
          : "bg-transparent text-gray-700 dark:text-gray-100",
        "flex flex-row items-center px-2 py-2"
      )}
    >
      <button
        className={cn("relative mx-3 flex size-3 cursor-pointer opacity-50")}
        onClick={() => actions.setHidden(id, !hidden)}
      >
        {hidden ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
      </button>
      <div ref={headerRef} className="flex grow flex-row items-center">
        {topLevel ? (
          <div className="-ml-6 mr-3">
            <Link />
          </div>
        ) : null}

        <div className="layer-name grow text-sm">
          <LayerName />
        </div>
        {children.length ? (
          <button onMouseDown={() => toggleLayer()} className="mr-2">
            {expanded ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </button>
        ) : null}
      </div>
    </div>
  )
}
