"use client"

import { Editor, Element, Frame } from "@craftjs/core"
import type { Organization, Prisma } from "@prisma/client"
import lz from "lzutf8"

import Header from "@/components/dashboard/header"
import CategoryBlock from "@/components/menu-editor/blocks/category-block"
import ContainerBlock from "@/components/menu-editor/blocks/container-block"
import HeaderBlock from "@/components/menu-editor/blocks/header-block"
import TextElement from "@/components/menu-editor/blocks/text-element"
import FloatingBar from "@/components/menu-editor/floating-bar"
import { RenderNode } from "@/components/menu-editor/render-node"
import SettingsPanel from "@/components/menu-editor/settings-panel"
import SyncStatus from "@/components/menu-editor/sync-status"
import Toolbar from "@/components/menu-editor/toolbar"
import ToolboxPanel from "@/components/menu-editor/toolbox-panel"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable"
import type { getCategoriesWithItems } from "@/server/actions/item/queries"
import type { getMenuById } from "@/server/actions/menu/queries"

export default function Workbench({
  menu,
  organization,
  categories
}: {
  menu: Prisma.PromiseReturnType<typeof getMenuById>
  organization: Organization
  categories: Prisma.PromiseReturnType<typeof getCategoriesWithItems>
}) {
  if (!menu || !categories) return null

  // Extract the serialized data from the menu
  let json = undefined
  if (menu.serialData) json = lz.decompress(lz.decodeBase64(menu.serialData))

  return (
    <div className="absolute inset-0">
      <Editor
        resolver={{ ContainerBlock, HeaderBlock, TextElement, CategoryBlock }}
        onRender={RenderNode}
      >
        <Header>
          <Toolbar menu={menu} />
        </Header>
        <ResizablePanelGroup className="grow pt-16" direction="horizontal">
          <ResizablePanel defaultSize={15} minSize={15} maxSize={25}>
            <ToolboxPanel categories={categories} />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={70}>
            <div className="relative h-full w-full overflow-y-auto bg-gray-50">
              <SyncStatus menu={menu} categories={categories} />
              <div className="mx-auto w-[390px] pb-24 pt-10">
                <div className="flex min-h-[600px] w-[390px] flex-col border bg-white">
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
          <ResizablePanel defaultSize={15} minSize={15} maxSize={25}>
            <SettingsPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </Editor>
    </div>
  )
}
