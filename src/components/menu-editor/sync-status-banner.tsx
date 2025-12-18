"use client"

import { useEffect, useMemo, useState } from "react"
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
  extractMenuDataFromNodes
} from "@/lib/sync-status"

export default function SyncStatusBanner({
  menu,
  location,
  categories,
  featuredItems,
  soloItems
}: {
  menu: Awaited<ReturnType<typeof getMenuById>>
  location: Awaited<ReturnType<typeof getDefaultLocation>> | null
  categories: Awaited<ReturnType<typeof getCategoriesWithItems>>
  featuredItems: Awaited<ReturnType<typeof getFeaturedItems>>
  soloItems: Awaited<ReturnType<typeof getMenuItemsWithoutCategory>>
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
    if (!menu?.serialData) {
      return
    }

    const nodes = decodeMenuNodes(menu.serialData)
    if (!nodes) {
      return
    }

    for (const property in nodes) {
      const component = nodes[property]
      if (component?.type?.resolvedName === "CategoryBlock") {
        const categoryId = (
          component?.props?.data as { id?: string } | undefined
        )?.id
        if (!categoryId) {
          continue
        }
        const dbCategory = categories.filter(
          dbCategory => dbCategory.id === categoryId
        )
        if (dbCategory[0]) {
          actions.setProp(property, props => {
            props.data = dbCategory[0]
          })
        }

        if (!dbCategory[0]) {
          actions.delete(property)
        }
      }

      if (component?.type?.resolvedName === "HeaderBlock") {
        actions.setProp(property, props => {
          props.organization = menu?.organization
          props.location = location
        })
      }

      if (component?.type?.resolvedName === "FeaturedBlock") {
        actions.setProp(property, props => {
          props.items = featuredItems
        })
      }

      if (component?.type?.resolvedName === "ItemBlock") {
        const itemId = (component?.props?.item as { id?: string } | undefined)
          ?.id
        if (!itemId) {
          continue
        }
        const dbItem = soloItems.find(dbItem => dbItem.id === itemId)
        if (dbItem) {
          actions.setProp(property, props => {
            props.item = dbItem
          })
        }

        if (!dbItem) {
          actions.delete(property)
        }
      }
    }

    toast.success("Información actualizada")
    setSyncReq(false)
  }

  return (
    <>
      {syncReq && (
        <div className="z-50 bg-indigo-100 px-4 py-2 sm:m-2 sm:rounded-lg dark:bg-indigo-900/50">
          <div className="flex flex-col justify-between gap-2 sm:flex-row">
            <div className="flex items-center gap-x-3">
              <RefreshCcw className="size-8 text-indigo-400 sm:size-4" />
              <span className="text-sm text-indigo-700 dark:text-indigo-300">
                La información del negocio o productos ha cambiado, sincroniza
                para aplicar los cambios
              </span>
            </div>
            <Button
              variant={isMobile ? "outline" : "link"}
              size="xs"
              className="text-indigo-700 dark:text-indigo-300"
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
