import { useNode, useEditor } from "@craftjs/core"
import { ROOT_NODE } from "@craftjs/utils"
import React, { useEffect, useRef, useCallback } from "react"
import ReactDOM from "react-dom"

import { ArrowUpIcon } from "@radix-ui/react-icons"
import { TrashIcon } from "@radix-ui/react-icons"
import { MoveIcon } from "@radix-ui/react-icons"

export const RenderNode = ({ render }) => {
  const { id } = useNode()
  const { actions, query, isActive } = useEditor((_, query) => ({
    isActive: query.getEvent("selected").contains(id)
  }))

  const {
    isHover,
    dom,
    name,
    moveable,
    deletable,
    connectors: { drag },
    parent
  } = useNode(node => ({
    isHover: node.events.hovered,
    dom: node.dom,
    name: node.data.custom.displayName || node.data.displayName,
    moveable: query.node(node.id).isDraggable(),
    deletable: query.node(node.id).isDeletable(),
    parent: node.data.parent,
    props: node.data.props
  }))

  const currentRef = useRef<HTMLDivElement>()

  useEffect(() => {
    if (dom) {
      if (isActive || isHover) dom.classList.add("component-selected")
      else dom.classList.remove("component-selected")
    }
  }, [dom, isActive, isHover])

  const getPos = useCallback((dom: HTMLElement) => {
    const { top, left, bottom } = dom
      ? dom.getBoundingClientRect()
      : { top: 0, left: 0, bottom: 0 }
    return {
      top: `${top > 0 ? top : bottom}px`,
      left: `${left}px`
    }
  }, [])

  const scroll = useCallback(() => {
    const { current: currentDOM } = currentRef

    if (!currentDOM) return
    const { top, left } = getPos(dom)
    currentDOM.style.top = top
    currentDOM.style.left = left
  }, [dom, getPos])

  useEffect(() => {
    document
      .querySelector(".craftjs-renderer")
      .addEventListener("scroll", scroll)

    return () => {
      document
        .querySelector(".craftjs-renderer")
        .removeEventListener("scroll", scroll)
    }
  }, [scroll])

  return (
    <>
      {isHover || isActive
        ? ReactDOM.createPortal(
            <div
              ref={currentRef}
              className="fixed -mt-6 flex h-6 items-center bg-blue-500 px-2 py-2 text-xs text-white"
              style={{
                left: getPos(dom).left,
                top: getPos(dom).top,
                zIndex: 9999
              }}
            >
              <h2 className="mr-4 flex-1">{name}</h2>
              {moveable ? (
                <a className="mr-2 cursor-move" ref={drag}>
                  <MoveIcon />
                </a>
              ) : null}
              {id !== ROOT_NODE && (
                <a
                  className="mr-2 cursor-pointer"
                  onClick={() => {
                    actions.selectNode(parent)
                  }}
                >
                  <ArrowUpIcon />
                </a>
              )}
              {deletable ? (
                <a
                  className="cursor-pointer"
                  onMouseDown={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    actions.delete(id)
                  }}
                >
                  <TrashIcon />
                </a>
              ) : null}
            </div>,
            document.querySelector(".page-container")
          )
        : null}
      {render}
    </>
  )
}
