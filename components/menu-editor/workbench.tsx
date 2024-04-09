"use client"

import { Editor, Element, Frame } from "@craftjs/core"
import type { Organization, Prisma } from "@prisma/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import lz from "lzutf8"

import Header from "@/components/dashboard/header"
import CategoryBlock from "@/components/menu-editor/blocks/category-block"
import ContainerBlock from "@/components/menu-editor/blocks/container-block"
import HeaderBlock from "@/components/menu-editor/blocks/header-block"
import TextElement from "@/components/menu-editor/blocks/text-element"
import { RenderNode } from "@/components/menu-editor/render-node"
import SettingsPanel from "@/components/menu-editor/settings-panel"
import Toolbar from "@/components/menu-editor/toolbar"
import ToolboxPanel from "@/components/menu-editor/toolbox-panel"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable"
import type { getCategoriesWithItems } from "@/server/actions/item/queries"
import { getMenuById } from "@/server/actions/menu/queries"

export default function Workbench({
  menuId,
  organization,
  categoryData
}: {
  menuId: string
  organization: Organization
  categoryData: Prisma.PromiseReturnType<typeof getCategoriesWithItems>
}) {
  // Get the menu data
  const { data } = useSuspenseQuery({
    queryKey: ["menu", menuId],
    queryFn: () => getMenuById(menuId)
  })

  if (!data) return null

  // Extract the serialized data from the menu
  const { serialData } = data
  let json = undefined
  if (serialData) json = lz.decompress(lz.decodeBase64(serialData))

  return (
    <Editor
      resolver={{ ContainerBlock, HeaderBlock, TextElement, CategoryBlock }}
      onRender={RenderNode}
    >
      <Header>
        <Toolbar menu={data} />
      </Header>
      <ResizablePanelGroup className="grow pt-16" direction="horizontal">
        <ResizablePanel defaultSize={15} minSize={15} maxSize={25}>
          <ToolboxPanel categoryData={categoryData} />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={70}>
          <div className="flex h-full grow items-center justify-center bg-gray-50">
            <div className="flex h-[600px] w-[390px] flex-col border bg-white">
              <Frame data={json}>
                <Element is={ContainerBlock} canvas>
                  <HeaderBlock organization={organization} />
                </Element>
              </Frame>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={15} minSize={15} maxSize={25}>
          <SettingsPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </Editor>
  )
}
