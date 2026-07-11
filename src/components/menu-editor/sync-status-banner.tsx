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
import type { getCurrentOrganization } from "@/server/actions/user/queries"
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
  organization,
  location,
  categories,
  featuredItems,
  soloItems,
  syncTrigger = 0,
  persistedVersion = 0,
  revertVersion = 0
}: {
  menu: Awaited<ReturnType<typeof getMenuById>>
  organization: Awaited<ReturnType<typeof getCurrentOrganization>>
  location: Awaited<ReturnType<typeof getDefaultLocation>> | null
  categories: Awaited<ReturnType<typeof getCategoriesWithItems>>
  featuredItems: Awaited<ReturnType<typeof getFeaturedItems>>
  soloItems: Awaited<ReturnType<typeof getMenuItemsWithoutCategory>>
  syncTrigger?: number
  persistedVersion?: number
  revertVersion?: number
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
  const [lastPersistedVersion, setLastPersistedVersion] = useState(0)
  const [lastRevertVersion, setLastRevertVersion] = useState(0)
  const [suppressedPersistedVersion, setSuppressedPersistedVersion] = useState<
    number | null
  >(null)

  const runSyncState = useCallback(() => {
    const synced = syncEditorWithMenuState({
      actions,
      menu,
      organization,
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
  }, [
    actions,
    menu,
    organization,
    location,
    categories,
    featuredItems,
    soloItems
  ])

  useEffect(() => {
    if (!syncTrigger || lastSyncTrigger === syncTrigger) {
      return
    }

    if (runSyncState()) {
      setLastSyncTrigger(syncTrigger)
    }
  }, [runSyncState, syncTrigger, lastSyncTrigger])

  useEffect(() => {
    if (revertVersion && revertVersion !== lastRevertVersion) {
      setSyncReq(false)
      setLastRevertVersion(revertVersion)
      setSuppressedPersistedVersion(persistedVersion)
      return
    }

    if (persistedVersion !== lastPersistedVersion) {
      setSyncReq(false)
      setLastPersistedVersion(persistedVersion)
      return
    }

    if (
      suppressedPersistedVersion !== null &&
      suppressedPersistedVersion === persistedVersion
    ) {
      setSyncReq(false)
      setSuppressedPersistedVersion(null)
      return
    }

    if (!menu?.serialData) {
      setSyncReq(false)
      return
    }

    if (!menuData) {
      setSyncReq(true)
      return
    }

    const categoriesInSync = areCategoriesInSync(
      menuData.categories,
      categories
    )
    const featuredInSync = areFeaturedItemsInSync(
      menuData.featuredItems,
      featuredItems,
      menuData.hasFeaturedBlock
    )
    const soloItemsInSync = areSoloItemsInSync(menuData.items, soloItems)
    const organizationInSync = areOrganizationsInSync(
      menuData.organization,
      organization
    )
    const locationInSync = areLocationsInSync(
      menuData.defaultLocation,
      location
    )

    const shouldSync =
      !categoriesInSync ||
      !featuredInSync ||
      !soloItemsInSync ||
      !organizationInSync ||
      !locationInSync

    setSyncReq(shouldSync)
  }, [
    persistedVersion,
    revertVersion,
    lastRevertVersion,
    lastPersistedVersion,
    suppressedPersistedVersion,
    syncTrigger,
    lastSyncTrigger,
    menu?.serialData,
    menu?.updatedAt,
    menu?.publishedAt,
    organization,
    menuData,
    categories,
    featuredItems,
    location,
    soloItems
  ])

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
              @sm:flex-row"
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
              onClick={runSyncState}
            >
              Sincronizar
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
