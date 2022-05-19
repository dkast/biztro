import { useEditor } from "@craftjs/core"
import React from "react"
import { useLayer } from "@craftjs/layers"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  EyeOffIcon,
  LinkIcon
} from "@heroicons/react/solid"

import { EditableLayerName } from "./EditableLayerName"
import classNames from "@/lib/classnames"

export const DefaultLayerHeader: React.FC = () => {
  const {
    id,
    depth,
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
      hidden: state.nodes[id] && state.nodes[id].data.hidden,
      selected,
      topLevel: query.node(id).isTopLevelCanvas()
    }
  })

  return (
    <div
      ref={drag}
      className={classNames(
        selected ? "bg-zinc-600 text-white" : "bg-transparent text-gray-500",
        "flex flex-row items-center px-1 py-2"
      )}
    >
      <a
        className={classNames("relative mx-3 flex h-3 w-3 cursor-pointer")}
        onClick={() => actions.setHidden(id, !hidden)}
      >
        {hidden ? <EyeOffIcon /> : <EyeIcon />}
      </a>
      <div className="flex-1">
        <div ref={layerHeader} className="flex">
          {topLevel ? (
            <div className="-ml-6 mr-3">
              <LinkIcon />
            </div>
          ) : null}

          <div className="layer-name flex-1 text-sm">
            <EditableLayerName />
          </div>
          <div>
            {children && children.length ? (
              <div onMouseDown={() => toggleLayer()} className="mr-2">
                {expanded ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
