import React, { useEffect, useRef, useState } from "react"
import { ROOT_NODE, useEditor } from "@craftjs/core"
import { useLayer } from "@craftjs/layers"
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Link,
  PenSquare
} from "lucide-react"

import {
  getMenuBlockIconColor,
  renderMenuBlockIcon,
  type MenuBlockIconKey
} from "@/components/menu-editor/block-icons"
import { LayerName } from "@/components/menu-editor/layers/layer-name"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

export default function LayerHeader() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [tempName, setTempName] = useState("")

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

  const {
    hidden,
    actions,
    selected,
    topLevel,
    nodes,
    parent,
    displayName,
    iconKey
  } = useEditor((state, query) => {
    const selected = query.getEvent("selected").first() === id
    const nodes = query.node(ROOT_NODE).descendants()
    const parent = state.nodes[id]?.data.parent
    const displayName = state.nodes[id]?.data.custom.displayName
      ? state.nodes[id]?.data.custom.displayName
      : state.nodes[id]?.data.displayName
    const iconKey = state.nodes[id]?.data.custom.iconKey as
      | MenuBlockIconKey
      | undefined

    return {
      hidden: state.nodes[id]?.data.hidden,
      selected,
      topLevel: query.node(id).isTopLevelCanvas(),
      nodes,
      parent,
      displayName,
      iconKey
    }
  })

  const currentIndex = nodes.findIndex((node: string) => node === id)

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

  const handleSaveName = () => {
    actions.setCustom(id, custom => (custom.displayName = tempName))
    setIsEditDialogOpen(false)
  }

  const isMobile = useIsMobile()

  const iconColor = getMenuBlockIconColor(iconKey)
  const iconClass = `size-4 ${iconColor ?? "text-gray-500 dark:text-gray-300"}`

  return (
    <div
      ref={divRef}
      className={cn(
        selected
          ? "rounded-sm bg-indigo-500 text-white dark:bg-indigo-600"
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
          <div className="mr-3 -ml-6">
            <Link />
          </div>
        ) : null}

        <div className="layer-name flex grow items-center gap-2 text-xs">
          {renderMenuBlockIcon(iconKey, iconClass)}
          <LayerName />
        </div>

        <button
          className="mx-2 opacity-50 hover:opacity-100"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <PenSquare className="size-3.5" />
        </button>

        {/* Mobile-only movement buttons */}
        <div className="mx-4 flex gap-4 sm:hidden">
          {id !== ROOT_NODE && (
            <button
              className="cursor-pointer active:scale-90"
              onClick={() => {
                const newIndex = currentIndex - 1
                actions.move(id, parent ?? ROOT_NODE, newIndex)
              }}
            >
              <ArrowUp className="size-4" />
            </button>
          )}
          {id !== ROOT_NODE && (
            <button
              className="cursor-pointer active:scale-90"
              onClick={() => {
                const newIndex = currentIndex + 2
                actions.move(id, parent ?? ROOT_NODE, newIndex)
              }}
            >
              <ArrowDown className="size-4" />
            </button>
          )}
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

      {isMobile ? (
        <Drawer
          open={isEditDialogOpen}
          onOpenChange={open => {
            setIsEditDialogOpen(open)
            if (open) setTempName(displayName)
          }}
        >
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Editar nombre</DrawerTitle>
              <DrawerDescription>
                Cambia el nombre de la sección.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <Input
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                placeholder="Escribe el nombre de la sección"
              />
              <div className="mt-6 flex">
                <Button onClick={handleSaveName} className="w-full">
                  Guardar
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={open => {
            setIsEditDialogOpen(open)
            if (open) setTempName(displayName)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar nombre</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                placeholder="Escribe el nombre de la sección"
              />
            </div>
            <DialogFooter>
              <Button onClick={handleSaveName}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
