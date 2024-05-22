import React, { useCallback, useEffect } from "react"
import ReactDOM from "react-dom"
// import { useRect } from "@/hooks/use-rect"
import { ROOT_NODE, useEditor, useNode } from "@craftjs/core"
import { useAtom } from "jotai"
import { ArrowUp, Clipboard, ClipboardPaste, Move, Trash } from "lucide-react"

import { elementPropsAtom } from "@/lib/atoms"

export const RenderNode = ({ render }: { render: unknown }) => {
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

  // const currentRef = useRef<HTMLDivElement>()
  // const rect = useRect(dom)
  // const [propsCopy, setPropsCopy] = useRecoilState(propState)
  const [propsCopy, setPropsCopy] = useAtom(elementPropsAtom)

  useEffect(() => {
    if (dom) {
      if (isActive) dom.classList.add("component-selected")
      else dom.classList.remove("component-selected")
      if (isHover) dom.classList.add("component-hovered")
      else dom.classList.remove("component-hovered")
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

  const onPasteProps = (clonedProps: unknown) => {
    actions.setProp(id, props => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      props = Object.assign(props, clonedProps) // skipcq: JS-0356
    })
  }

  const onCopyProps = (props: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, text, ...propsCopy } = props // skipcq: JS-0356
    setPropsCopy(propsCopy)
  }

  return (
    <>
      {isActive
        ? ReactDOM.createPortal(
            <div
              // ref={currentRef}
              className="fixed z-40 -mt-7 flex h-6 items-center gap-3 rounded bg-gray-800 px-2 py-2 text-xs text-white"
              style={{
                left: getPos().left,
                top: getPos().top
              }}
            >
              <h2 className="flex">{name}</h2>
              {moveable ? (
                <span
                  className="cursor-move"
                  ref={ref => {
                    if (ref) {
                      drag(ref)
                    }
                  }}
                >
                  <Move className="size-3" />
                </span>
              ) : null}
              {id !== ROOT_NODE && (
                <button
                  className="cursor-pointer active:scale-90"
                  onClick={() => {
                    actions.selectNode(parent ?? undefined)
                  }}
                >
                  <ArrowUp className="size-3.5" />
                </button>
              )}
              {deletable ? (
                <button
                  className="cursor-pointer active:scale-90"
                  onMouseDown={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    actions.delete(id)
                  }}
                >
                  <Trash className="size-3.5" />
                </button>
              ) : null}
              <button
                className="cursor-pointer active:scale-90"
                onClick={() => {
                  onCopyProps(props)
                }}
              >
                <Clipboard className="size-3.5" />
              </button>
              {Object.keys(propsCopy).length !== 0 ? (
                <button
                  className="cursor-pointer active:scale-90"
                  onClick={() => onPasteProps(propsCopy)}
                >
                  <ClipboardPaste className="size-3.5" />
                </button>
              ) : null}
            </div>,
            document.querySelector(".page-container") ?? document.body
          )
        : null}
      {render}
    </>
  )
}
