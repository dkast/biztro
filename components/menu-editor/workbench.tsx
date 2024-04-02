"use client"

import { Editor, Element, Frame } from "@craftjs/core"
import type { Organization } from "@prisma/client"

import ContainerBlock from "@/components/menu-editor/blocks/container-block"
import HeaderBlock from "@/components/menu-editor/blocks/header-block"
import { RenderNode } from "@/components/menu-editor/render-node"
import SettingsPanel from "@/components/menu-editor/settings-panel"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable"

export default function Workbench({
  organization
}: {
  organization: Organization
}) {
  return (
    <Editor resolver={{ ContainerBlock, HeaderBlock }} onRender={RenderNode}>
      <ResizablePanelGroup className="grow" direction="horizontal">
        <ResizablePanel defaultSize={15} minSize={15} maxSize={25}>
          <div className="bg-red-50">Sidebar</div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={70}>
          <div className="flex h-full grow items-center justify-center bg-gray-50">
            <div className="flex h-[600px] w-[390px] flex-col border bg-white">
              <Frame>
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
