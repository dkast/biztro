"use client"

import {
  Activity,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react"
import IFrame, { FrameContextConsumer } from "react-frame-component"
import { toast } from "react-hot-toast"
import type { Layout } from "react-resizable-panels"
import { Editor, Element, Frame } from "@craftjs/core"
import { Layers } from "@craftjs/layers"
import { useAtom, useSetAtom } from "jotai"
import { ChevronLeft, SheetIcon } from "lucide-react"
import lz from "lzutf8"
import { useOptimisticAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"

import Header from "@/components/dashboard/header"
import { TooltipHelper } from "@/components/dashboard/tooltip-helper"
import {
  GuardLink,
  useSetUnsavedChanges
} from "@/components/dashboard/unsaved-changes-provider"
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
import {
  MenuItemsDataGrid,
  type MenuItemRow
} from "@/components/menu-editor/menu-items-data-grid"
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
import { Toggle } from "@/components/ui/toggle"
import { updateItem } from "@/server/actions/item/mutations"
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

type ItemsState = {
  categories: Awaited<ReturnType<typeof getCategoriesWithItems>>
  soloItems: Awaited<ReturnType<typeof getMenuItemsWithoutCategory>>
  featuredItems: Awaited<ReturnType<typeof getFeaturedItems>>
}

type VariantBroad = Record<string, unknown> & {
  id: string
  name: string
  price: number
  description: string | null
}

type MenuItemBroad = Record<string, unknown> & {
  id: string
  name: string | null
  description: string | null
  status: string
  categoryId: string | null
  featured: boolean
  currency: string | null
  variants: VariantBroad[]
}

type UpdateItemOptimisticInput = {
  id?: string
  name: string
  description?: string
  status: string
  categoryId?: string | null
  featured?: boolean
  currency?: string | null
  variants?: {
    id?: string
    name: string
    price: number
    description?: string | null
    menuItemId?: string
  }[]
}

function normalizeCategoryId(categoryId: string | null | undefined) {
  if (!categoryId || categoryId === "") return null
  return categoryId
}

function sortByName<T extends { name: string | null }>(items: T[]) {
  return [...items].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
}

function applyOptimisticItemUpdate(
  state: ItemsState,
  input: UpdateItemOptimisticInput
): ItemsState {
  if (!input.id) {
    return state
  }

  // The server query return types can collapse to overly-narrow array types in client code.
  // Widen them here for manipulation, then cast back on return.
  const categories = state.categories as unknown as Array<
    Record<string, unknown> & {
      id: string
      name: string | null
      menuItems: MenuItemBroad[]
    }
  >
  const soloItems = state.soloItems as unknown as MenuItemBroad[]
  const featuredItems = state.featuredItems as unknown as MenuItemBroad[]

  const nextCategoryId = normalizeCategoryId(input.categoryId)
  const nextFeatured = Boolean(input.featured)
  const nextStatus = input.status

  const nextDescription = input.description ?? ""

  // Find the existing item first (avoid relying on callback side-effects for TS control flow).
  let existingItem: MenuItemBroad | null = null
  for (const category of categories) {
    const found = category.menuItems.find(menuItem => menuItem.id === input.id)
    if (found) {
      existingItem = found
      break
    }
  }
  if (!existingItem) {
    existingItem = soloItems.find(menuItem => menuItem.id === input.id) ?? null
  }
  if (!existingItem) {
    existingItem =
      featuredItems.find(menuItem => menuItem.id === input.id) ?? null
  }

  // Remove the item from all collections.
  const categoriesWithoutItem = categories
    .map(category => {
      const nextMenuItems = category.menuItems.filter(
        menuItem => menuItem.id !== input.id
      )
      return nextMenuItems.length === category.menuItems.length
        ? category
        : { ...category, menuItems: nextMenuItems }
    })
    .filter(category => category.menuItems.length > 0)

  const soloWithoutItem = soloItems.filter(menuItem => menuItem.id !== input.id)
  const featuredWithoutItem = featuredItems.filter(
    menuItem => menuItem.id !== input.id
  )

  // If we can’t find it in current state, just return unchanged.
  if (!existingItem) {
    return state
  }

  // If item becomes non-ACTIVE, it should disappear from these lists (server queries filter by ACTIVE).
  if (nextStatus !== "ACTIVE") {
    return {
      categories: categoriesWithoutItem as unknown as ItemsState["categories"],
      soloItems: soloWithoutItem as unknown as ItemsState["soloItems"],
      featuredItems:
        featuredWithoutItem as unknown as ItemsState["featuredItems"]
    }
  }

  const nextVariants = [...existingItem.variants]
    .map(variant => {
      const incoming = input.variants?.find(v => v.id && v.id === variant.id)
      if (!incoming) return variant
      return {
        ...variant,
        name: incoming.name,
        price: incoming.price,
        description: incoming.description ?? null
      }
    })
    .sort((a, b) => a.price - b.price)

  const updatedItem = {
    ...existingItem,
    name: input.name,
    description: nextDescription,
    status: nextStatus,
    categoryId: nextCategoryId,
    featured: nextFeatured,
    currency: input.currency ?? existingItem.currency ?? "MXN",
    variants: nextVariants
  } satisfies MenuItemBroad

  let nextCategories = categoriesWithoutItem
  let nextSoloItems = soloWithoutItem

  if (nextCategoryId) {
    const categoryIndex = nextCategories.findIndex(c => c.id === nextCategoryId)
    if (categoryIndex >= 0) {
      const category = nextCategories[categoryIndex]
      if (!category) {
        nextSoloItems = sortByName([...nextSoloItems, updatedItem])
      } else {
        const nextMenuItems = sortByName([
          ...category.menuItems,
          updatedItem as unknown as (typeof category.menuItems)[number]
        ])
        nextCategories = nextCategories.map((c, i) =>
          i === categoryIndex ? { ...c, menuItems: nextMenuItems } : c
        )
      }
    } else {
      // If the category isn't present in the current ACTIVE-only list, fall back to solo.
      nextSoloItems = sortByName([...nextSoloItems, updatedItem])
    }
  } else {
    nextSoloItems = sortByName([...nextSoloItems, updatedItem])
  }

  const nextFeaturedItems = nextFeatured
    ? sortByName([...featuredWithoutItem, updatedItem])
    : featuredWithoutItem

  return {
    categories: nextCategories as unknown as ItemsState["categories"],
    soloItems: nextSoloItems as unknown as ItemsState["soloItems"],
    featuredItems: nextFeaturedItems as unknown as ItemsState["featuredItems"]
  }
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
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<PanelType | null>(null)
  const [shouldRenderFrame, setShouldRenderFrame] = useState(true)
  const [iframeHeight, setIframeHeight] = useState(0)
  const [isDataGridView, setIsDataGridView] = useState(false)
  // Key to force ScrollArea re-render after ResizablePanel establishes dimensions
  const [scrollAreaKey, setScrollAreaKey] = useState(0)

  // Data grid dirty tracking and batch save
  const [gridDirtyItems, setGridDirtyItems] = useState<MenuItemRow[]>([])
  const [isGridDirty, setIsGridDirty] = useState(false)
  const [isBatchSaving, setIsBatchSaving] = useState(false)
  const [syncEditorTrigger, setSyncEditorTrigger] = useState(0)

  // Unsaved changes context for grid dirty state
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges()

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

  const serverItemsState = useMemo<ItemsState>(
    () => ({ categories, soloItems, featuredItems }),
    [categories, soloItems, featuredItems]
  )

  const { executeAsync: executeUpdateItemOptimistic, optimisticState } =
    useOptimisticAction(updateItem, {
      currentState: serverItemsState,
      updateFn: (state, next) =>
        applyOptimisticItemUpdate(
          state as ItemsState,
          next as unknown as UpdateItemOptimisticInput
        )
    })

  const effectiveItemsState = (optimisticState ??
    serverItemsState) as ItemsState

  // Batch save function for grid items
  const batchSaveGridItems = useCallback(
    async (items: MenuItemRow[]) => {
      if (items.length === 0) return false

      setIsBatchSaving(true)
      let successCount = 0
      let failCount = 0
      const failedIds = new Set<string>()

      for (const item of items) {
        try {
          const result = await executeUpdateItemOptimistic({
            id: item.id,
            name: item.name,
            description: item.description ?? "",
            status: item.status,
            categoryId: item.categoryId ?? "",
            organizationId: item.organizationId,
            featured: item.featured,
            currency: item.currency,
            // Force draft menu sync even when preference is null
            updatePublishedMenus: false,
            variants: item.variants.map(v => ({
              id: v.id,
              name: v.name,
              price: v.price,
              description: v.description ?? undefined,
              menuItemId: v.menuItemId
            })) as [
              {
                id: string
                name: string
                price: number
                description?: string
                menuItemId: string
              },
              ...{
                id: string
                name: string
                price: number
                description?: string
                menuItemId: string
              }[]
            ]
          })

          if (result?.data?.success) {
            successCount++
          } else {
            failCount++
            failedIds.add(item.id)
          }
        } catch (error) {
          console.error("Error saving item:", item.id, error)
          failCount++
          failedIds.add(item.id)
        }
      }

      setIsBatchSaving(false)

      const allSaved = successCount > 0 && failCount === 0

      if (allSaved) {
        setGridDirtyItems([])
        setIsGridDirty(false)
        clearUnsavedChanges()
        toast.success(
          `${successCount} producto${successCount > 1 ? "s" : ""} guardado${successCount > 1 ? "s" : ""}`
        )

        // Sync the canvas immediately using optimistic data, then reconcile from the server.
        setSyncEditorTrigger(prev => prev + 1)
        // router.refresh()
        return true
      }

      // Partial/failed save: keep the failed rows dirty.
      const remainingDirty = items.filter(i => failedIds.has(i.id))
      setGridDirtyItems(remainingDirty)
      setIsGridDirty(remainingDirty.length > 0)

      if (successCount > 0) {
        // Still sync for the successfully saved items.
        setSyncEditorTrigger(prev => prev + 1)
        router.refresh()
      }

      if (failCount > 0 && successCount > 0) {
        toast.error(
          `Se guardaron ${successCount} y ${failCount} no se pudo${failCount > 1 ? "ieron" : ""} guardar`
        )
      } else if (failCount > 0) {
        toast.error(
          `Error: ${failCount} producto${failCount > 1 ? "s" : ""} no se pudo${failCount > 1 ? "ieron" : ""} guardar`
        )
      }

      return false
    },
    [clearUnsavedChanges, executeUpdateItemOptimistic, router]
  )

  // Handle grid dirty state changes
  const handleGridDirtyChange = useCallback(
    (isDirty: boolean, dirtyItems?: MenuItemRow[]) => {
      setIsGridDirty(isDirty)
      if (dirtyItems) {
        setGridDirtyItems(dirtyItems)
      }
      if (isDirty) {
        setUnsavedChanges({
          message:
            "Tienes cambios sin guardar en el editor de productos. ¿Deseas guardarlos?",
          dismissButtonLabel: "Cancelar",
          proceedLinkLabel: "Descartar cambios"
        })
      } else {
        clearUnsavedChanges()
      }
    },
    [setUnsavedChanges, clearUnsavedChanges]
  )

  const handleDataGridToggle = useCallback(
    (next: boolean) => {
      if (isDataGridView && !next && isGridDirty) {
        toast("Tienes cambios sin guardar en el editor de productos")
      }
      setIsDataGridView(next)
    },
    [isDataGridView, isGridDirty]
  )

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

  // Refresh data when tab becomes visible (only if no dirty edits)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !isGridDirty && gridDirtyItems.length === 0) {
        router.refresh()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isGridDirty, gridDirtyItems.length, router])

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
              categories={effectiveItemsState.categories}
              soloItems={effectiveItemsState.soloItems}
              featuredItems={effectiveItemsState.featuredItems}
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
              categories={effectiveItemsState.categories}
              featuredItems={effectiveItemsState.featuredItems}
              soloItems={effectiveItemsState.soloItems}
              syncTrigger={syncEditorTrigger}
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
              <div className="flex items-center gap-1">
                <GuardLink href={"/dashboard"}>
                  <Button variant="ghost" size="sm">
                    <ChevronLeft className="size-5" />
                    Regresar
                  </Button>
                </GuardLink>
                <TooltipHelper
                  content={
                    isDataGridView
                      ? "Ocultar editor de productos"
                      : "Mostrar editor de productos"
                  }
                >
                  <div>
                    <Toggle
                      size="sm"
                      variant="default"
                      pressed={isDataGridView}
                      onPressedChange={handleDataGridToggle}
                      aria-label="Toggle data grid view"
                    >
                      <SheetIcon className="size-4" />
                    </Toggle>
                  </div>
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
            <Activity mode={isDataGridView ? "hidden" : "visible"}>
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
                      categories={effectiveItemsState.categories}
                      soloItems={effectiveItemsState.soloItems}
                      featuredItems={effectiveItemsState.featuredItems}
                      isPro={organization.plan?.toUpperCase() === "PRO"}
                    />
                    <Separator />
                    <Layers renderLayer={DefaultLayer} />
                  </div>
                </ScrollArea>
              </ResizablePanel>
            </Activity>
            <Activity mode={isDataGridView ? "visible" : "hidden"}>
              <ResizablePanel id="data-grid" defaultSize="70%">
                <MenuItemsDataGrid
                  categories={effectiveItemsState.categories}
                  soloItems={effectiveItemsState.soloItems}
                  featuredItems={effectiveItemsState.featuredItems}
                  organizationId={organization.id}
                  onDirtyChange={(isDirty, dirtyItems) =>
                    handleGridDirtyChange(isDirty, dirtyItems)
                  }
                  isSaving={isBatchSaving}
                  onManualSave={batchSaveGridItems}
                />
              </ResizablePanel>
            </Activity>
            <ResizableHandle />
            <ResizablePanel id="canvas">
              <div
                id="editor-canvas"
                className="no-scrollbar bg-secondary relative h-full w-full
                  overflow-y-auto"
              >
                <SyncStatusBanner
                  menu={menu}
                  location={location}
                  categories={effectiveItemsState.categories}
                  featuredItems={effectiveItemsState.featuredItems}
                  soloItems={effectiveItemsState.soloItems}
                  syncTrigger={syncEditorTrigger}
                />
                <div
                  className={cn(
                    frameSize === FrameSize.DESKTOP ? "w-5xl" : "w-97.5",
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
                      frameSize === FrameSize.DESKTOP ? "w-5xl" : "w-97.5",
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
                <Activity mode={isDataGridView ? "hidden" : "visible"}>
                  <FloatingBar />
                </Activity>
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <Activity mode={isDataGridView ? "hidden" : "visible"}>
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
            </Activity>
          </ResizablePanelGroup>
        </Editor>
      )}
    </div>
  )
}
