"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import IFrame, { FrameContextConsumer } from "react-frame-component"
import { Editor, Element, Frame } from "@craftjs/core"
import { Layers } from "@craftjs/layers"
import type { Prisma } from "@prisma/client"
import { useAtom, useSetAtom } from "jotai"
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
import { BottomBar } from "@/components/menu-editor/bottom-bar"
import CssStyles from "@/components/menu-editor/css-styles"
import FloatingBar from "@/components/menu-editor/floating-bar"
import DefaultLayer from "@/components/menu-editor/layers/default-layer"
import MenuPublish from "@/components/menu-editor/menu-publish"
import MenuTour from "@/components/menu-editor/menu-tour"
import MenuTourMobile from "@/components/menu-editor/menu-tour-mobile"
import { RenderNode } from "@/components/menu-editor/render-node"
import SettingsPanel from "@/components/menu-editor/settings-panel"
import SyncStatus from "@/components/menu-editor/sync-status"
import ThemeSelector from "@/components/menu-editor/theme-selector"
import Toolbar from "@/components/menu-editor/toolbar"
import ToolboxPanel from "@/components/menu-editor/toolbox-panel"
import { DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
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
import type { getCurrentOrganization } from "@/server/actions/user/queries"
import { useIsMobile } from "@/hooks/use-mobile"
import { colorThemeAtom, fontThemeAtom, frameSizeAtom } from "@/lib/atoms"
import { FrameSize } from "@/lib/types"
import { cn } from "@/lib/utils"

export enum PanelType {
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
  organization: Prisma.PromiseReturnType<typeof getCurrentOrganization>
  location: Prisma.PromiseReturnType<typeof getDefaultLocation> | null
  categories: Prisma.PromiseReturnType<typeof getCategoriesWithItems>
  soloItems: Prisma.PromiseReturnType<typeof getMenuItemsWithoutCategory>
  featuredItems: Prisma.PromiseReturnType<typeof getFeaturedItems>
}) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<PanelType | null>(null)
  const [shouldRenderFrame, setShouldRenderFrame] = useState(true)

  // Initialize the atoms for the editor
  const [frameSize] = useAtom(frameSizeAtom)
  const setFontThemeId = useSetAtom(fontThemeAtom)
  const setColorThemeId = useSetAtom(colorThemeAtom)
  // Initialize themes only on first load

  useEffect(() => {
    setFontThemeId(menu?.fontTheme ?? "DEFAULT")
    setColorThemeId(menu?.colorTheme ?? "DEFAULT")
  }, [menu?.fontTheme, menu?.colorTheme, setFontThemeId, setColorThemeId])

  // Keep a ref to the frame document so we can clean up side effects (video/audio/iframes)
  const frameDocRef = useRef<Document | null>(null)

  // Use useLayoutEffect so cleanup runs immediately when Activity hides this component
  useLayoutEffect(() => {
    setShouldRenderFrame(true)
    return () => {
      setShouldRenderFrame(false)

      const doc = frameDocRef.current
      // Pause media elements in the iframe document (if present)
      if (doc) {
        try {
          // Pause any playing audio/video elements inside the iframe's document
          ;(
            doc.querySelectorAll("video, audio") as NodeListOf<HTMLMediaElement>
          ).forEach(el => {
            try {
              el.pause()
            } catch {
              // ignore
            }
          })

          // If there are nested iframes inside the frame, try to pause their media as well
          ;(
            doc.querySelectorAll("iframe") as NodeListOf<HTMLIFrameElement>
          ).forEach(iframe => {
            try {
              const win = iframe.contentWindow
              // Try to post a message to the iframe content window to let it cleanup itself
              win?.postMessage({ type: "react-activity-hidden" }, "*")
              // As a fallback, attempt to set src to about:blank to ensure network/audio stops
              // but avoid doing this by default to preserve state — only do if necessary.
            } catch {
              // ignore
            }
          })
        } catch {
          // ignore errors in cleanup
        }
      }

      // Pause any playing audio/video elements inside the host document's editor area
      try {
        const container = document.getElementById("editor-canvas")
        if (container) {
          ;(
            container.querySelectorAll(
              "video, audio"
            ) as NodeListOf<HTMLMediaElement>
          ).forEach(el => {
            try {
              el.pause()
            } catch {
              // ignore
            }
          })
          ;(
            container.querySelectorAll(
              "iframe"
            ) as NodeListOf<HTMLIFrameElement>
          ).forEach(iframe => {
            try {
              const win = iframe.contentWindow
              win?.postMessage({ type: "react-activity-hidden" }, "*")
            } catch {
              // ignore
            }
          })
        }
      } catch {
        // ignore
      }
    }
  }, [])

  if (!menu || !categories || !organization) return null

  // Extract the serialized data from the menu
  let json: string | undefined
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
              <DrawerTitle>Secciones</DrawerTitle>
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
        <div className={cn("bg-background flex h-full flex-col")}>
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
            <Header className="editor-topbar relative py-4">
              <MenuPublish menu={menu} />
            </Header>
            <SyncStatus
              menu={menu}
              location={location}
              categories={categories}
              featuredItems={featuredItems}
              soloItems={soloItems}
            />
            <div className="pb-20">
              <Frame data={json}>
                <Element is={ContainerBlock} canvas>
                  <HeaderBlock
                    layout="modern"
                    organization={organization}
                    location={location ?? undefined}
                    showBanner={organization.banner !== null}
                  />
                </Element>
              </Frame>
              <FloatingBar />
              <BottomBar
                setActivePanel={setActivePanel}
                setIsOpen={setIsOpen}
                isOpen={isOpen}
                getPanelContent={getPanelContent}
              />
              <MenuTourMobile />
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
            className="bg-card grow pt-16"
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
              <div
                id="editor-canvas"
                className="no-scrollbar bg-secondary relative h-full w-full overflow-y-auto"
              >
                <SyncStatus
                  menu={menu}
                  location={location}
                  categories={categories}
                  featuredItems={featuredItems}
                  soloItems={soloItems}
                />
                <div
                  className={cn(
                    frameSize === FrameSize.DESKTOP ? "w-5xl" : "w-[390px]",
                    "editor-preview group mx-auto pt-10 pb-24 transition-all duration-300 ease-in-out"
                  )}
                >
                  <span className="editor-size block p-2 text-center text-sm text-gray-400">
                    {frameSize === FrameSize.DESKTOP ? "Escritorio" : "Móvil"}
                  </span>
                  <div
                    className={cn(
                      frameSize === FrameSize.DESKTOP ? "w-5xl" : "w-[390px]",
                      "flex min-h-[800px] flex-col border bg-white transition-all duration-300 ease-in-out dark:border-gray-700"
                    )}
                  >
                    {shouldRenderFrame ? (
                      <IFrame className="grow" key={`frame-${menu.id}`}>
                        <FrameContextConsumer>
                          {({ document: frameDocument }) => {
                            // Store the frame document so the outer component can clean up side effects
                            frameDocRef.current = frameDocument ?? null
                            return (
                              <CssStyles frameDocument={frameDocument}>
                                <Frame data={json}>
                                  <Element is={ContainerBlock} canvas>
                                    <HeaderBlock
                                      layout="modern"
                                      organization={organization}
                                      location={location ?? undefined}
                                      showBanner={organization.banner !== null}
                                    />
                                  </Element>
                                </Frame>
                              </CssStyles>
                            )
                          }}
                        </FrameContextConsumer>
                      </IFrame>
                    ) : (
                      <div className="text-muted-foreground flex grow items-center justify-center text-sm">
                        Vista previa pausada
                      </div>
                    )}
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
