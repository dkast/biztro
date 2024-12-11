"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useEditor } from "@craftjs/core"
import type { Organization, Prisma } from "@prisma/client"
import { RefreshCcw } from "lucide-react"
import lz from "lzutf8"

import { Button } from "@/components/ui/button"
import type {
  getCategoriesWithItems,
  getFeaturedItems
} from "@/server/actions/item/queries"
import type { getDefaultLocation } from "@/server/actions/location/queries"
import type { getMenuById } from "@/server/actions/menu/queries"
import difference from "@/lib/difference"

export default function SyncStatus({
  menu,
  location,
  categories,
  featuredItems // Add featuredItems prop
}: {
  menu: Prisma.PromiseReturnType<typeof getMenuById>
  location: Prisma.PromiseReturnType<typeof getDefaultLocation> | null
  categories: Prisma.PromiseReturnType<typeof getCategoriesWithItems>
  featuredItems: Prisma.PromiseReturnType<typeof getFeaturedItems> // Add type
}) {
  const { actions } = useEditor()
  const [syncReq, setSyncReq] = useState(false)

  useEffect(() => {
    if (menu && menu?.serialData) {
      // Get Menu Items and check if update is necessary
      const serial = lz.decompress(lz.decodeBase64(menu?.serialData))
      const objectData = JSON.parse(serial)
      const menuCategories: Prisma.PromiseReturnType<
        typeof getCategoriesWithItems
      > = []
      const menuFeaturedItems: Prisma.PromiseReturnType<
        typeof getFeaturedItems
      > = []
      let organization: Organization | null = null
      let defaultLocation: Prisma.PromiseReturnType<
        typeof getDefaultLocation
      > | null = null

      for (const property in objectData) {
        const component = objectData[property]
        if (component?.type?.resolvedName === "CategoryBlock") {
          menuCategories.push(component?.props?.data)
        }

        if (component?.type?.resolvedName === "HeaderBlock") {
          organization = component?.props?.organization
          defaultLocation = component?.props?.location
        }

        if (component?.type?.resolvedName === "FeaturedBlock") {
          menuFeaturedItems.push(...(component?.props?.items || []))
        }
      }

      // Compare categories
      let equalData = true
      equalData = menuCategories.every(menuCategory => {
        const dbCategory = categories.filter(
          dbCategory => dbCategory.id === menuCategory.id
        )

        if (typeof dbCategory[0]?.updatedAt !== "object") {
          console.error("dbCategory not found")
          return false
        }

        return (
          dbCategory[0]?.updatedAt.getTime() ===
          new Date(menuCategory.updatedAt).getTime()
        )
      })

      if (!equalData) {
        setSyncReq(true)
        return
      }

      // Compare items
      equalData = menuCategories.every(menuCategory => {
        const dbCategory = categories.filter(
          dbCategory => dbCategory.id === menuCategory.id
        )

        return menuCategory.menuItems.every(menuItem => {
          const dbItem = dbCategory[0]?.menuItems.filter(
            dbItem => dbItem.id === menuItem.id
          )

          if (dbItem === null || dbItem === undefined) {
            console.error("dbItem not found")
            return false
          }

          if (dbItem[0] && typeof dbItem[0]?.updatedAt !== "object") {
            console.error("dbCategory not found")
            return false
          }

          return (
            dbItem[0]?.updatedAt.getTime() ===
            new Date(menuItem.updatedAt).getTime()
          )
        })
      })

      if (!equalData) {
        setSyncReq(true)
        return
      }

      // Search for items not currently present in the menu
      equalData = categories.every(dbCategory => {
        const menuCategory = menuCategories.filter(
          menuCategory => menuCategory.id === dbCategory.id
        )

        // If the category is present in the menu, check if all items are present
        if (menuCategory.length > 0) {
          return dbCategory.menuItems.every(dbItem => {
            const menuItem = menuCategory[0]?.menuItems.filter(
              menuItem => menuItem.id === dbItem.id
            )

            return menuItem?.length ?? 0 > 0
          })
        } else {
          // If the category is not present in the menu, return true so it can be added to the menu
          return true
        }
      })

      if (!equalData) {
        setSyncReq(true)
        return
      }

      // Compare featured items
      let equalFeatured = true
      if (menuFeaturedItems.length !== featuredItems.length) {
        equalFeatured = false
      } else {
        equalFeatured = menuFeaturedItems.every(menuItem => {
          const dbItem = featuredItems.find(dbItem => dbItem.id === menuItem.id)
          if (!dbItem) return false

          if (typeof dbItem.updatedAt !== "object") {
            console.error("dbItem not found")
            return false
          }

          return (
            dbItem.updatedAt.getTime() ===
            new Date(menuItem.updatedAt).getTime()
          )
        })
      }

      if (!equalFeatured) {
        setSyncReq(true)
        return
      }

      // Check changed properties, exclude serialData and updatedAt
      let equalMenu = true
      if (organization) {
        const diff = difference(organization, menu.organization)
        // console.log(diff)
        Object.getOwnPropertyNames(diff).forEach(propName => {
          if (
            propName === "banner" ||
            propName === "logo" ||
            propName === "name"
          ) {
            equalMenu = false
          }
        })
      }

      if (defaultLocation && !location) {
        equalMenu = false
      }

      if (!defaultLocation && location) {
        equalMenu = false
      }

      if (defaultLocation && location) {
        const diff = difference(defaultLocation, location)
        // console.log(location.openingHours)
        // console.log(diff)
        Object.getOwnPropertyNames(diff).forEach(propName => {
          if (
            propName === "address" ||
            propName === "phone" ||
            propName === "facebook" ||
            propName === "instagram" ||
            propName === "twitter" ||
            propName === "tiktok" ||
            propName === "whatsapp" ||
            propName === "website"
          ) {
            equalMenu = false
          }
        })

        if (
          !defaultLocation.openingHours &&
          location.openingHours &&
          location.openingHours.length > 0
        ) {
          equalMenu = false
        }

        if (
          defaultLocation.openingHours &&
          defaultLocation.openingHours.length > 0
        ) {
          location.openingHours.forEach((entry, index) => {
            const diff = difference(
              defaultLocation.openingHours[index] ?? {},
              entry ?? {}
            )
            // console.log(diff)
            Object.getOwnPropertyNames(diff).forEach(propName => {
              if (
                propName === "allDay" ||
                propName === "startTime" ||
                propName === "endTime"
              ) {
                equalMenu = false
              }
            })
          })
        }
      }

      // console.log(equalData, equalMenu, equalFeatured)
      setSyncReq(!equalData || !equalMenu || !equalFeatured)
    }
  }, [menu, categories, location, featuredItems, setSyncReq])

  const syncState = () => {
    if (menu && menu?.serialData) {
      const serial = lz.decompress(lz.decodeBase64(menu?.serialData))
      const objectData = JSON.parse(serial)

      for (const property in objectData) {
        const component = objectData[property]
        if (component?.type?.resolvedName === "CategoryBlock") {
          const dbCategory = categories.filter(
            dbCategory => dbCategory.id === component?.props?.data.id
          )
          if (dbCategory[0]) {
            actions.setProp(property, props => {
              props.data = dbCategory[0]
            })
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
      }

      toast.success("Información actualizada")
      setSyncReq(false)
    }
  }

  return (
    <>
      {syncReq && (
        <div className="m-2 rounded-lg bg-violet-100 px-4 py-2 dark:bg-violet-900/50">
          <div className="flex justify-between">
            <div className="flex items-center gap-x-3">
              <RefreshCcw className="size-4 text-violet-400" />
              <span className="text-sm text-violet-700 dark:text-violet-300">
                La información del negocio o productos ha cambiado, puedes
                sincronizar para aplicar los últimos cambios
              </span>
            </div>
            <Button
              variant="link"
              size="xs"
              className="text-violet-700"
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
