"use client"

import { useEffect, useState } from "react"
import { Editor, Element, Frame } from "@craftjs/core"
import { Layers } from "@craftjs/layers"
import type { Organization, Prisma } from "@prisma/client"
import { useAtom, useSetAtom } from "jotai"
import {
  Layers as LayersIcon,
  Settings2,
  SquarePlus,
  SwatchBook
} from "lucide-react"
import lz from "lzutf8"

import Header from "@/components/dashboard/header"
import CategoryBlock from "@/components/menu-editor/blocks/category-block"
import ContainerBlock from "@/components/menu-editor/blocks/container-block"
import FeaturedBlock from "@/components/menu-editor/blocks/featured-block"
import HeaderBlock from "@/components/menu-editor/blocks/header-block"
import HeadingElement from "@/components/menu-editor/blocks/heading-element"
import ItemBlock from "@/components/menu-editor/blocks/item-block"
import NavigatorBlock from "@/components/menu-editor/blocks/navigator-block"
import TextElement from "@/components/menu-editor/blocks/text-element"
import FloatingBar from "@/components/menu-editor/floating-bar"
import DefaultLayer from "@/components/menu-editor/layers/default-layer"
import MenuTour from "@/components/menu-editor/menu-tour"
import { RenderNode } from "@/components/menu-editor/render-node"
import SettingsPanel from "@/components/menu-editor/settings-panel"
import SyncStatus from "@/components/menu-editor/sync-status"
import ThemeSelector from "@/components/menu-editor/theme-selector"
import Toolbar from "@/components/menu-editor/toolbar"
import ToolboxPanel from "@/components/menu-editor/toolbox-panel"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import type {
  getCategoriesWithItems,
  getFeaturedItems,
  getMenuItemsWithoutCategory
} from "@/server/actions/item/queries"
import type { getDefaultLocation } from "@/server/actions/location/queries"
import type { getMenuById } from "@/server/actions/menu/queries"
import { useIsMobile } from "@/hooks/use-mobile"
import { colorThemeAtom, fontThemeAtom, frameSizeAtom } from "@/lib/atoms"
import { FrameSize } from "@/lib/types"
import { cn } from "@/lib/utils"

enum PanelType {
  SETTINGS = "settings",
  TOOLBOX = "toolbox",
  LAYERS = "layers",
  THEME = "theme"
}

export default function Workbench({
  menu,
  organization,
  location,
  categories,
  soloItems,
  featuredItems
}: {
  menu: Prisma.PromiseReturnType<typeof getMenuById>
  organization: Organization
  location: Prisma.PromiseReturnType<typeof getDefaultLocation> | null
  categories: Prisma.PromiseReturnType<typeof getCategoriesWithItems>
  soloItems: Prisma.PromiseReturnType<typeof getMenuItemsWithoutCategory>
  featuredItems: Prisma.PromiseReturnType<typeof getFeaturedItems>
}) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<PanelType | null>(null)

  // Initialize the atoms for the editor
  const [frameSize] = useAtom(frameSizeAtom)
  const setFontThemeId = useSetAtom(fontThemeAtom)
  const setColorThemeId = useSetAtom(colorThemeAtom)
  // Initialize themes only on first load

  useEffect(() => {
    setFontThemeId(menu?.fontTheme ?? "DEFAULT")
    setColorThemeId(menu?.colorTheme ?? "DEFAULT")
  }, []) // Empty dependency array ensures this runs once

  if (!menu || !categories) return null

  // Extract the serialized data from the menu
  let json
  if (menu.serialData) json = lz.decompress(lz.decodeBase64(menu.serialData))

  const getPanelContent = () => {
    switch (activePanel) {
      case PanelType.THEME:
        return (
          <>
            <DrawerHeader>
              <DrawerTitle>Temas</DrawerTitle>
            </DrawerHeader>
            <ThemeSelector menu={menu} />
          </>
        )
      case PanelType.SETTINGS:
        return (
          <>
            <DrawerHeader>
              <DrawerTitle>Ajustes</DrawerTitle>
            </DrawerHeader>
            <SettingsPanel />
          </>
        )
      case PanelType.TOOLBOX:
        return (
          <>
            <DrawerHeader>
              <DrawerTitle>Elementos</DrawerTitle>
            </DrawerHeader>
            <ToolboxPanel
              organization={organization}
              location={location}
              categories={categories}
              soloItems={soloItems}
              featuredItems={featuredItems}
              isPro={organization.plan === "PRO"}
            />
          </>
        )
      case PanelType.LAYERS:
        return (
          <>
            <DrawerHeader>
              <DrawerTitle>Capas</DrawerTitle>
            </DrawerHeader>
            <Layers renderLayer={DefaultLayer} />
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="absolute inset-0">
      {isMobile ? (
        <div className={cn("flex h-full flex-col bg-gray-50 dark:bg-gray-800")}>
          <Header className="relative py-4" />
          <Editor
            resolver={{
              ContainerBlock,
              HeaderBlock,
              HeadingElement,
              TextElement,
              CategoryBlock,
              ItemBlock,
              NavigatorBlock,
              FeaturedBlock
            }}
            onRender={RenderNode}
          >
            <div className="pb-20">
              <Frame data={json}>
                <Element is={ContainerBlock} canvas>
                  <HeaderBlock
                    layout="modern"
                    organization={organization}
                    location={location ?? undefined}
                  />
                </Element>
              </Frame>
              <div className="fixed bottom-0 flex w-full flex-row items-center justify-between bg-gray-50 px-8 pb-8 pt-4 dark:border-t dark:border-gray-700 dark:bg-gray-800">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => {
                    setActivePanel(PanelType.TOOLBOX)
                    setIsOpen(true)
                  }}
                >
                  <SquarePlus className="size-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => {
                    setActivePanel(PanelType.THEME)
                    setIsOpen(true)
                  }}
                >
                  <SwatchBook className="size-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => {
                    setActivePanel(PanelType.LAYERS)
                    setIsOpen(true)
                  }}
                >
                  <LayersIcon className="size-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => {
                    setActivePanel(PanelType.SETTINGS)
                    setIsOpen(true)
                  }}
                >
                  <Settings2 className="size-8" />
                </Button>
              </div>
              <Drawer open={isOpen} onOpenChange={setIsOpen}>
                <DrawerContent>
                  <ScrollArea className="h-[80vh]">
                    {getPanelContent()}
                  </ScrollArea>
                </DrawerContent>
              </Drawer>
            </div>
          </Editor>
        </div>
      ) : (
        <Editor
          resolver={{
            ContainerBlock,
            HeaderBlock,
            HeadingElement,
            TextElement,
            CategoryBlock,
            ItemBlock,
            NavigatorBlock,
            FeaturedBlock
          }}
          onRender={RenderNode}
        >
          <Header className="fixed inset-x-0 top-0">
            <Toolbar menu={menu} />
            <MenuTour />
          </Header>
          <ResizablePanelGroup
            className="grow pt-16 dark:bg-gray-900"
            direction="horizontal"
          >
            <ResizablePanel defaultSize={15} minSize={15} maxSize={25}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={60}>
                  <ScrollArea className="h-full">
                    <ToolboxPanel
                      organization={organization}
                      location={location}
                      categories={categories}
                      soloItems={soloItems}
                      featuredItems={featuredItems}
                      isPro={organization.plan === "PRO"} // Add this line
                    />
                  </ScrollArea>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={35} minSize={10}>
                  <ScrollArea className="h-full">
                    <Layers renderLayer={DefaultLayer} />
                  </ScrollArea>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={70}>
              <div className="no-scrollbar relative h-full w-full overflow-y-auto bg-gray-50 dark:bg-gray-800">
                <SyncStatus
                  menu={menu}
                  location={location}
                  categories={categories}
                  featuredItems={featuredItems}
                  soloItems={soloItems}
                />
                <div
                  className={cn(
                    frameSize === FrameSize.DESKTOP
                      ? "w-[1024px]"
                      : "w-[390px]",
                    "editor-preview group mx-auto pb-24 pt-10 transition-all duration-300 ease-in-out"
                  )}
                >
                  <span className="editor-size block p-2 text-center text-sm text-gray-400">
                    {frameSize === FrameSize.DESKTOP ? "Escritorio" : "Móvil"}
                  </span>
                  <div
                    className={cn(
                      frameSize === FrameSize.DESKTOP
                        ? "w-[1024px]"
                        : "w-[390px]",
                      "flex min-h-[600px] flex-col border bg-white transition-all duration-300 ease-in-out dark:border-gray-700"
                    )}
                  >
                    <Frame data={json}>
                      <Element is={ContainerBlock} canvas>
                        <HeaderBlock
                          layout="modern"
                          organization={organization}
                          location={location ?? undefined}
                        />
                      </Element>
                    </Frame>
                  </div>
                </div>
                <FloatingBar />
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel
              defaultSize={15}
              minSize={15}
              maxSize={25}
              className="flex"
            >
              <div className="flex w-full flex-col">
                <ScrollArea className="h-full">
                  <ThemeSelector menu={menu} />
                  <SettingsPanel />
                </ScrollArea>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Editor>
      )}
    </div>
  )
}
