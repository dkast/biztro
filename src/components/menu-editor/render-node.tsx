import React, { useCallback, useEffect, useState, type ReactNode } from "react"
import ReactDOM from "react-dom"
import { ROOT_NODE, useEditor, useNode } from "@craftjs/core"
import { useAtom } from "jotai"
import {
  ArrowDown,
  ArrowUp,
  Clipboard,
  ClipboardPaste,
  Move,
  SquareMousePointer,
  Trash
} from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { elementPropsAtom } from "@/lib/atoms"

export const RenderNode = ({ render }: { render: ReactNode }) => {
  const { id } = useNode()
  const { actions, query, isActive, nodes } = useEditor((_state, query) => ({
    isActive: query.getEvent("selected").contains(id),
    nodes: query.node(ROOT_NODE).decendants()
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

  const isMobile = useIsMobile()

  const [propsCopy, setPropsCopy] = useAtom(elementPropsAtom)
  const [scrollPosition, setScrollPosition] = useState(0) // New state for scroll position
  const [index, setIndex] = useState<number>(-1) // Added state for index

  useEffect(() => {
    if (!isActive) return
    setIndex(nodes.findIndex((node: string) => node === id))
  }, [isActive, nodes, id, index])

  useEffect(() => {
    if (dom) {
      if (isActive) dom.classList.add("component-selected")
      else dom.classList.remove("component-selected")
      if (isHover) dom.classList.add("component-hovered")
      else dom.classList.remove("component-hovered")
    }
  }, [dom, isActive, isHover])

  // Listen for scroll events in the editor canvas to update the position of the context menu
  useEffect(() => {
    const editorCanvas = document.getElementById("editor-canvas")
    const handleScroll = () => {
      setScrollPosition(Date.now()) // Update state to trigger getPos
    }

    const debounceHandleScroll = debounce(handleScroll, 200) // Debounce the scroll handler

    editorCanvas?.addEventListener("scroll", debounceHandleScroll)
    return () => {
      editorCanvas?.removeEventListener("scroll", debounceHandleScroll)
    }
  }, [])

  const getPos = useCallback(() => {
    const { top, left, bottom } = dom
      ? dom.getBoundingClientRect()
      : { top: 0, left: 0, bottom: 0 }
    return {
      top: `${top > 0 ? top : bottom}px`,
      left: `${left}px`
    }
  }, [dom, scrollPosition]) // Added scrollPosition to dependencies to trigger re-render on scroll

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
              className="fixed z-40 flex h-8 items-center gap-5 rounded bg-gray-800 p-4 text-xs text-white shadow dark:bg-gray-900 sm:-mt-7 sm:h-6 sm:gap-3 sm:p-2"
              style={{
                left: isMobile ? "auto" : getPos().left,
                top: getPos().top,
                right: isMobile ? 10 : "auto"
              }}
            >
              <h2 className="flex">{name}</h2>
              {moveable ? (
                <span
                  className="hidden cursor-move sm:block"
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
                    const newIndex = index - 1
                    actions.move(id, parent ?? ROOT_NODE, newIndex)
                  }}
                >
                  <ArrowUp className="size-5 sm:size-3.5" />
                </button>
              )}
              {id !== ROOT_NODE && (
                <button
                  className="cursor-pointer active:scale-90"
                  onClick={() => {
                    const newIndex = index + 2
                    actions.move(id, parent ?? ROOT_NODE, newIndex)
                  }}
                >
                  <ArrowDown className="size-5 sm:size-3.5" />
                </button>
              )}
              {deletable ? (
                <button
                  className="cursor-pointer active:scale-90"
                  onMouseDown={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    if (isMobile) {
                      if (
                        window.confirm(
                          "¿Estás seguro de remover este elemento?"
                        )
                      ) {
                        actions.delete(id)
                      }
                    } else {
                      actions.delete(id)
                    }
                  }}
                >
                  <Trash className="size-5 sm:size-3.5" />
                </button>
              ) : null}
              <button
                className="cursor-pointer active:scale-90"
                onClick={() => {
                  onCopyProps(props)
                }}
              >
                <Clipboard className="size-5 sm:size-3.5" />
              </button>
              {Object.keys(propsCopy).length !== 0 ? (
                <button
                  className="cursor-pointer active:scale-90"
                  onClick={() => onPasteProps(propsCopy)}
                >
                  <ClipboardPaste className="size-5 sm:size-3.5" />
                </button>
              ) : null}
              {id !== ROOT_NODE && (
                <button
                  className="cursor-pointer active:scale-90"
                  onClick={() => {
                    actions.selectNode(parent ?? undefined)
                  }}
                >
                  <SquareMousePointer className="size-5 sm:size-3.5" />
                </button>
              )}
            </div>,
            document.querySelector(".page-container") ?? document.body
          )
        : null}
      {render}
    </>
  )
}

// Debounce function implementation
function debounce(func: () => void, wait: number) {
  let timeout: NodeJS.Timeout
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func()
    }, wait)
  }
}
