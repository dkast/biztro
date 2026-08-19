import { LayoutList, Settings2, SquarePlus, SwatchBook } from "lucide-react"

import { PanelType } from "@/components/menu-editor/workbench"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BottomBarProps {
  setActivePanel: (panel: PanelType) => void
  setIsOpen: (open: boolean) => void
  isOpen: boolean
  panelTitle: string
  getPanelContent: () => React.ReactNode
}

export function BottomBar({
  setActivePanel,
  setIsOpen,
  isOpen,
  panelTitle,
  getPanelContent
}: BottomBarProps) {
  return (
    <>
      <div
        className="editor-bottombar fixed bottom-0 z-10 flex w-full flex-row
          items-center justify-between border-t bg-gray-50 px-8 pt-1 pb-3
          dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full [&_svg]:size-6"
            onClick={() => {
              setActivePanel(PanelType.TOOLBOX)
              setIsOpen(true)
            }}
          >
            <SquarePlus className="size-6" />
          </Button>
          <span className="text-xs text-gray-600 dark:text-gray-300">
            Elementos
          </span>
        </div>
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full [&_svg]:size-6"
            onClick={() => {
              setActivePanel(PanelType.THEME)
              setIsOpen(true)
            }}
          >
            <SwatchBook className="size-6" />
          </Button>
          <span className="text-xs text-gray-600 dark:text-gray-300">
            Temas
          </span>
        </div>
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full [&_svg]:size-6"
            onClick={() => {
              setActivePanel(PanelType.LAYERS)
              setIsOpen(true)
            }}
          >
            <LayoutList className="size-6" />
          </Button>
          <span className="text-xs text-gray-600 dark:text-gray-300">
            Secciones
          </span>
        </div>
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full [&_svg]:size-6"
            onClick={() => {
              setActivePanel(PanelType.SETTINGS)
              setIsOpen(true)
            }}
          >
            <Settings2 className="size-6" />
          </Button>
          <span className="text-xs text-gray-600 dark:text-gray-300">
            Ajustes
          </span>
        </div>
      </div>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent
          className="flex h-[calc(100%-1rem)] flex-col gap-0 overflow-hidden
            p-0"
        >
          <DrawerHeader className="shrink-0 border-b px-5 py-4">
            <DrawerTitle>{panelTitle}</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="min-h-0 flex-1">
            {getPanelContent()}
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </>
  )
}
