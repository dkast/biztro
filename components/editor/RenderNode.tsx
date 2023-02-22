// import { useRect } from "@/hooks/useRect"
import { ROOT_NODE, useEditor, useNode } from "@craftjs/core"
import {
  ArrowUpIcon,
  ClipboardCopyIcon,
  CopyIcon,
  MoveIcon,
  TrashIcon
} from "@radix-ui/react-icons"
import React, { useCallback, useEffect, useRef } from "react"
import ReactDOM from "react-dom"
import { useRecoilState } from "recoil"

import { propState } from "@/lib/store"

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
    parent,
    props
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
  // const rect = useRect(dom)
  const [propsCopy, setPropsCopy] = useRecoilState(propState)

  useEffect(() => {
    if (dom) {
      if (isActive || isHover) dom.classList.add("component-selected")
      else dom.classList.remove("component-selected")
    }
  }, [dom, isActive, isHover])

  const getPos = useCallback(() => {
    const { top, left, bottom } = dom
      ? dom.getBoundingClientRect()
      : { top: 0, left: 0, bottom: 0 }
    // console.dir(dom)
    return {
      top: `${top > 0 ? top : bottom}px`,
      left: `${left}px`
    }
  }, [dom])

  const onPasteProps = clonedProps => {
    actions.setProp(id, props => {
      props = Object.assign(props, clonedProps)
    })
  }

  const onCopyProps = props => {
    const { item, text, ...propsCopy } = props
    setPropsCopy(propsCopy)
  }

  return (
    <>
      {isActive
        ? ReactDOM.createPortal(
            <div
              ref={currentRef}
              className="fixed z-40 -mt-7 flex h-6 items-center rounded bg-violet-600 px-2 py-2 text-xs text-white"
              style={{
                left: getPos().left,
                top: getPos().top
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
                  className="mr-2 cursor-pointer active:scale-90"
                  onClick={() => {
                    actions.selectNode(parent)
                  }}
                >
                  <ArrowUpIcon />
                </a>
              )}
              {deletable ? (
                <a
                  className="mr-2 cursor-pointer active:scale-90"
                  onMouseDown={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    actions.delete(id)
                  }}
                >
                  <TrashIcon />
                </a>
              ) : null}
              <a
                className="cursor-pointer active:scale-90"
                onClick={() => {
                  onCopyProps(props)
                }}
              >
                <CopyIcon />
              </a>
              {propsCopy ? (
                <a
                  className="ml-2 cursor-pointer active:scale-90"
                  onClick={() => onPasteProps(propsCopy)}
                >
                  <ClipboardCopyIcon />
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
