"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { useEditor } from "@craftjs/core"
import { RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import type {
  getCategoriesWithItems,
  getFeaturedItems,
  getMenuItemsWithoutCategory
} from "@/server/actions/item/queries"
import type { getDefaultLocation } from "@/server/actions/location/queries"
import type { getMenuById } from "@/server/actions/menu/queries"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  areCategoriesInSync,
  areFeaturedItemsInSync,
  areLocationsInSync,
  areOrganizationsInSync,
  areSoloItemsInSync,
  decodeMenuNodes,
  extractMenuDataFromNodes,
  syncEditorWithMenuState
} from "@/lib/sync-status"

export default function SyncStatusBanner({
  menu,
  location,
  categories,
  featuredItems,
  soloItems,
  syncTrigger = 0
}: {
  menu: Awaited<ReturnType<typeof getMenuById>>
  location: Awaited<ReturnType<typeof getDefaultLocation>> | null
  categories: Awaited<ReturnType<typeof getCategoriesWithItems>>
  featuredItems: Awaited<ReturnType<typeof getFeaturedItems>>
  soloItems: Awaited<ReturnType<typeof getMenuItemsWithoutCategory>>
  syncTrigger?: number
}) {
  const { actions } = useEditor()
  const [syncReq, setSyncReq] = useState(false)
  const isMobile = useIsMobile()

  const menuNodes = useMemo(
    () => decodeMenuNodes(menu?.serialData),
    [menu?.serialData]
  )
  const menuData = useMemo(
    () => (menuNodes ? extractMenuDataFromNodes(menuNodes) : null),
    [menuNodes]
  )

  const [lastSyncTrigger, setLastSyncTrigger] = useState(0)

  const runSyncState = useCallback(() => {
    const synced = syncEditorWithMenuState({
      actions,
      menu,
      location,
      categories,
      featuredItems,
      soloItems
    })

    if (!synced) {
      return false
    }

    toast.success("Información actualizada")
    setSyncReq(false)
    return true
  }, [actions, menu, location, categories, featuredItems, soloItems])

  useEffect(() => {
    if (!syncTrigger || lastSyncTrigger === syncTrigger) {
      return
    }

    if (runSyncState()) {
      setLastSyncTrigger(syncTrigger)
    }
  }, [runSyncState, syncTrigger, lastSyncTrigger])

  useEffect(() => {
    if (!menu?.serialData) {
      setSyncReq(false)
      return
    }

    if (!menuData) {
      setSyncReq(true)
      return
    }

    const hasContentChanges =
      !areCategoriesInSync(menuData.categories, categories) ||
      !areFeaturedItemsInSync(
        menuData.featuredItems,
        featuredItems,
        menuData.hasFeaturedBlock
      ) ||
      !areSoloItemsInSync(menuData.items, soloItems)

    const organizationOutOfSync = !areOrganizationsInSync(
      menuData.organization,
      menu.organization ?? null
    )

    const locationOutOfSync = !areLocationsInSync(
      menuData.defaultLocation,
      location
    )

    setSyncReq(hasContentChanges || organizationOutOfSync || locationOutOfSync)
  }, [
    menu?.serialData,
    menu?.organization,
    menuData,
    categories,
    featuredItems,
    location,
    soloItems
  ])

  const syncState = () => {
    runSyncState()
  }

  return (
    /* skipcq: JS-0424 */
    <>
      {syncReq && (
        <div
          className="@container z-50 bg-indigo-100 px-4 py-2 sm:m-2
            sm:rounded-lg dark:bg-indigo-900/50"
        >
          <div
            className="flex flex-col items-center justify-between gap-2
              sm:flex-row"
          >
            <div className="flex items-center gap-x-3">
              <RefreshCcw
                className="hidden size-8 text-indigo-400 sm:size-4 @md:block"
              />
              <span className="text-sm text-indigo-700 dark:text-indigo-300">
                La información del negocio o productos ha cambiado, sincroniza
                para aplicar los cambios
              </span>
            </div>
            <Button
              variant={isMobile ? "outline" : "link"}
              size="xs"
              className="w-full text-indigo-700 @md:w-auto dark:text-indigo-300"
              onClick={() => syncState()}
            >
              Sincronizar
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
