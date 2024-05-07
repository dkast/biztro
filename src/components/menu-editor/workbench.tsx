"use client"

import { Editor, Element, Frame } from "@craftjs/core"
import { Layers } from "@craftjs/layers"
import type { Location, Organization, Prisma } from "@prisma/client"
import { useAtom } from "jotai"
import { useHydrateAtoms } from "jotai/utils"
import { Palette, Settings2 } from "lucide-react"
import lz from "lzutf8"

import Header from "@/components/dashboard/header"
import CategoryBlock from "@/components/menu-editor/blocks/category-block"
import ContainerBlock from "@/components/menu-editor/blocks/container-block"
import HeaderBlock from "@/components/menu-editor/blocks/header-block"
import HeadingElement from "@/components/menu-editor/blocks/heading-element"
import TextElement from "@/components/menu-editor/blocks/text-element"
import FloatingBar from "@/components/menu-editor/floating-bar"
import DefaultLayer from "@/components/menu-editor/layers/default-layer"
import { RenderNode } from "@/components/menu-editor/render-node"
import SettingsPanel from "@/components/menu-editor/settings-panel"
import SyncStatus from "@/components/menu-editor/sync-status"
import ThemeSelector from "@/components/menu-editor/theme-selector"
import Toolbar from "@/components/menu-editor/toolbar"
import ToolboxPanel from "@/components/menu-editor/toolbox-panel"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { getCategoriesWithItems } from "@/server/actions/item/queries"
import type { getMenuById } from "@/server/actions/menu/queries"
import { colorThemeAtom, fontThemeAtom, frameSizeAtom } from "@/lib/atoms"
import { FrameSize } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function Workbench({
  menu,
  organization,
  location,
  categories
}: {
  menu: Prisma.PromiseReturnType<typeof getMenuById>
  organization: Organization
  location: Location | null
  categories: Prisma.PromiseReturnType<typeof getCategoriesWithItems>
}) {
  // Initialize the atoms for the editor
  const [frameSize] = useAtom(frameSizeAtom)
  useHydrateAtoms([[fontThemeAtom, menu?.fontTheme ?? "DEFAULT"]])
  useHydrateAtoms([[colorThemeAtom, menu?.colorTheme ?? "DEFAULT"]])

  if (!menu || !categories) return null

  // Extract the serialized data from the menu
  let json = undefined
  if (menu.serialData) json = lz.decompress(lz.decodeBase64(menu.serialData))

  return (
    <div className="absolute inset-0">
      <Editor
        resolver={{
          ContainerBlock,
          HeaderBlock,
          HeadingElement,
          TextElement,
          CategoryBlock
        }}
        onRender={RenderNode}
      >
        <Header>
          <Toolbar menu={menu} />
        </Header>
        <ResizablePanelGroup className="grow pt-16" direction="horizontal">
          <ResizablePanel defaultSize={15} minSize={15} maxSize={25}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={60}>
                <ToolboxPanel
                  organization={organization}
                  location={location}
                  categories={categories}
                />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={35} minSize={10}>
                <Layers renderLayer={DefaultLayer} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={70}>
            <div className="no-scrollbar relative h-full w-full overflow-y-auto bg-gray-50">
              <SyncStatus menu={menu} categories={categories} />
              <div
                className={cn(
                  frameSize === FrameSize.DESKTOP ? "w-[1024px]" : "w-[390px]",
                  "mx-auto pb-24 pt-10"
                )}
              >
                <div
                  className={cn(
                    frameSize === FrameSize.DESKTOP
                      ? "w-[1024px]"
                      : "w-[390px]",
                    "flex min-h-[600px] flex-col border bg-white"
                  )}
                >
                  <Frame data={json}>
                    <Element is={ContainerBlock} canvas>
                      <HeaderBlock organization={organization} />
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
            <Tabs defaultValue="theme" className="flex grow flex-col">
              <TabsList className="m-2 grid grid-cols-2">
                <TabsTrigger
                  value="theme"
                  className="flex flex-row items-center gap-1 rounded"
                >
                  <Palette className="hidden size-3.5 lg:block" />
                  <span>Tema</span>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex flex-row items-center gap-1 rounded"
                >
                  <Settings2 className="hidden size-3.5 lg:block" />
                  <span>Ajustes</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="theme" className="grow">
                <ThemeSelector menu={menu} />
              </TabsContent>
              <TabsContent value="settings">
                <SettingsPanel />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Editor>
    </div>
  )
}
