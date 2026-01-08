"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "react"
import IFrame, { FrameContextConsumer } from "react-frame-component"
import type { Layout } from "react-resizable-panels"
import { Editor, Element, Frame } from "@craftjs/core"
import { Layers } from "@craftjs/layers"
import { useAtom, useSetAtom } from "jotai"
import { ChevronLeft, SheetIcon } from "lucide-react"
import lz from "lzutf8"

import Header from "@/components/dashboard/header"
import { TooltipHelper } from "@/components/dashboard/tooltip-helper"
import { GuardLink } from "@/components/dashboard/unsaved-changes-provider"
import CategoryBlock from "@/components/menu-editor/blocks/category-block"
import ContainerBlock from "@/components/menu-editor/blocks/container-block"
import FeaturedBlock from "@/components/menu-editor/blocks/featured-block"
import HeaderBlock from "@/components/menu-editor/blocks/header-block"
import HeadingElement from "@/components/menu-editor/blocks/heading-element"
import ItemBlock from "@/components/menu-editor/blocks/item-block"
import NavigatorBlock from "@/components/menu-editor/blocks/navigator-block"
import TextElement from "@/components/menu-editor/blocks/text-element"
import { BottomBar } from "@/components/menu-editor/bottom-bar"
import FloatingBar from "@/components/menu-editor/floating-bar"
import { FramePreviewContent } from "@/components/menu-editor/frame-preview-content"
import DefaultLayer from "@/components/menu-editor/layers/default-layer"
import MenuPublish from "@/components/menu-editor/menu-publish"
import MenuTitle from "@/components/menu-editor/menu-title"
import MenuTour from "@/components/menu-editor/menu-tour"
import MenuTourMobile from "@/components/menu-editor/menu-tour-mobile"
import { RenderNode } from "@/components/menu-editor/render-node"
import SettingsPanel from "@/components/menu-editor/settings-panel"
import SyncStatusBanner from "@/components/menu-editor/sync-status-banner"
import ThemeSelector from "@/components/menu-editor/theme-selector"
import ToolboxPanel from "@/components/menu-editor/toolbox-panel"
import { Button } from "@/components/ui/button"
import { DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
  featuredItems,
  defaultLayout: serverDefaultLayout
}: {
  menu: Awaited<ReturnType<typeof getMenuById>>
  organization: Awaited<ReturnType<typeof getCurrentOrganization>>
  location: Awaited<ReturnType<typeof getDefaultLocation>> | null
  categories: Awaited<ReturnType<typeof getCategoriesWithItems>>
  soloItems: Awaited<ReturnType<typeof getMenuItemsWithoutCategory>>
  featuredItems: Awaited<ReturnType<typeof getFeaturedItems>>
  defaultLayout?: Layout
}) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<PanelType | null>(null)
  const [shouldRenderFrame, setShouldRenderFrame] = useState(true)
  const [iframeHeight, setIframeHeight] = useState(0)
  // Key to force ScrollArea re-render after ResizablePanel establishes dimensions
  const [scrollAreaKey, setScrollAreaKey] = useState(0)

  // Initialize the atoms for the editor
  const [frameSize] = useAtom(frameSizeAtom)
  const setFontThemeId = useSetAtom(fontThemeAtom)
  const setColorThemeId = useSetAtom(colorThemeAtom)

  // Setup persistent layout using cookies for SSR compatibility
  const onLayoutChange = useCallback((layout: Layout) => {
    // Store a JSON representation of the layout object (map of panelId -> size)
    const cookieValue = encodeURIComponent(JSON.stringify(layout))
    const isSecure = window.location.protocol === "https:"
    const secureFlag = isSecure ? "; Secure" : ""
    document.cookie = `react-resizable-panels:layout:menu-editor-workbench=${cookieValue}; path=/; max-age=31536000; SameSite=Lax${secureFlag}`
  }, [])

  // Initialize themes only on first load
  useEffect(() => {
    setFontThemeId(menu?.fontTheme ?? "DEFAULT")
    setColorThemeId(menu?.colorTheme ?? "DEFAULT")
  }, [menu?.fontTheme, menu?.colorTheme, setFontThemeId, setColorThemeId])

  // Force ScrollArea re-render after ResizablePanel establishes dimensions
  // Double RAF ensures we're past the paint phase when layout is complete
  useEffect(() => {
    let frameId: number
    const doubleRAF = () => {
      frameId = requestAnimationFrame(() => {
        frameId = requestAnimationFrame(() => {
          setScrollAreaKey(prev => prev + 1)
        })
      })
    }
    doubleRAF()
    return () => cancelAnimationFrame(frameId)
  }, [])

  // Keep a ref to the frame document so we can clean up side effects (video/audio/iframes)
  const frameDocRef = useRef<Document | null>(null)

  const getFrameContentHeight = useCallback((doc: Document) => {
    const main = doc.querySelector("main") as HTMLElement | null
    if (main) {
      return Math.max(main.scrollHeight ?? 0, main.offsetHeight ?? 0)
    }

    const body = doc.body
    const html = doc.documentElement
    return Math.max(
      body?.scrollHeight ?? 0,
      body?.offsetHeight ?? 0,
      html?.scrollHeight ?? 0,
      html?.offsetHeight ?? 0
    )
  }, [])

  const updateFrameHeight = useCallback(() => {
    const doc = frameDocRef.current
    if (!doc) return

    const contentHeight = getFrameContentHeight(doc)
    if (!contentHeight) return

    setIframeHeight(prev => {
      const nextHeight = Math.min(Math.max(contentHeight, 600), 1200)
      return prev === nextHeight ? prev : nextHeight
    })
  }, [frameDocRef, getFrameContentHeight])

  const handleNodesChange = useCallback(() => {
    updateFrameHeight()
  }, [updateFrameHeight])

  // Use useLayoutEffect so cleanup runs immediately when Activity hides this component
  useLayoutEffect(() => {
    setShouldRenderFrame(true)
    return () => {
      setShouldRenderFrame(false)

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
              isPro={organization.plan?.toUpperCase() === "PRO"}
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
            <SyncStatusBanner
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
          onNodesChange={handleNodesChange}
        >
          <Header className="fixed inset-x-0 top-0">
            <div className="mx-10 grid grow grid-cols-3 items-center">
              <div className="flex items-center">
                <GuardLink href={"/dashboard"}>
                  <Button variant="ghost" size="sm">
                    <ChevronLeft className="size-5" />
                    Regresar
                  </Button>
                </GuardLink>
                <TooltipHelper content="Editar productos y categorías">
                  <Button size="xs" variant="ghost" onClick={() => {}}>
                    <SheetIcon className="size-4" />
                  </Button>
                </TooltipHelper>
              </div>
              <MenuTitle menu={menu} />
              <MenuPublish menu={menu} />
            </div>
            <MenuTour />
          </Header>
          <ResizablePanelGroup
            className="bg-card grow pt-16"
            orientation="horizontal"
            defaultLayout={serverDefaultLayout}
            onLayoutChange={onLayoutChange}
          >
            <ResizablePanel
              id="left"
              defaultSize="18%"
              minSize="15%"
              maxSize="25%"
            >
              <ScrollArea
                key={`left-panel-${scrollAreaKey}`}
                className="h-full"
              >
                <div className="pb-2">
                  <ToolboxPanel
                    organization={organization}
                    location={location}
                    categories={categories}
                    soloItems={soloItems}
                    featuredItems={featuredItems}
                    isPro={organization.plan?.toUpperCase() === "PRO"}
                  />
                  <Separator />
                  <Layers renderLayer={DefaultLayer} />
                </div>
              </ScrollArea>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id="center">
              <div
                id="editor-canvas"
                className="no-scrollbar bg-secondary relative h-full w-full
                  overflow-y-auto"
              >
                <SyncStatusBanner
                  menu={menu}
                  location={location}
                  categories={categories}
                  featuredItems={featuredItems}
                  soloItems={soloItems}
                />
                <div
                  className={cn(
                    frameSize === FrameSize.DESKTOP ? "w-5xl" : "w-[390px]",
                    `editor-preview group mx-auto pt-10 pb-24 transition-all
                      duration-300 ease-in-out`
                  )}
                >
                  <span
                    className="editor-size block p-2 text-center text-sm
                      text-gray-400"
                  >
                    {frameSize === FrameSize.DESKTOP ? "Escritorio" : "Móvil"}
                  </span>
                  <div
                    className={cn(
                      frameSize === FrameSize.DESKTOP ? "w-5xl" : "w-[390px]",
                      `flex flex-col border bg-white transition-all duration-300
                        ease-in-out dark:border-gray-700`
                    )}
                    style={{
                      height: iframeHeight,
                      minHeight: 600,
                      maxHeight: 1200
                    }}
                  >
                    {shouldRenderFrame ? (
                      <IFrame
                        className="grow"
                        key={`frame-${menu.id}`}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <FrameContextConsumer>
                          {({ document: frameDocument }) => {
                            return (
                              <FramePreviewContent
                                frameDocument={frameDocument}
                                frameDocRef={frameDocRef}
                                json={json}
                                organization={organization}
                                location={location}
                                updateFrameHeight={updateFrameHeight}
                              />
                            )
                          }}
                        </FrameContextConsumer>
                      </IFrame>
                    ) : (
                      <div
                        className="text-muted-foreground flex grow items-center
                          justify-center text-sm"
                      >
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
              id="right"
              defaultSize="18%"
              minSize="15%"
              maxSize="25%"
            >
              <ScrollArea
                key={`right-panel-${scrollAreaKey}`}
                className="h-full"
              >
                <ThemeSelector menu={menu} />
                <SettingsPanel />
              </ScrollArea>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Editor>
      )}
    </div>
  )
}
