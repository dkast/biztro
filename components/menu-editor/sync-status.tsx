"use client"

import { useEffect, useState } from "react"
import type { Organization, Prisma } from "@prisma/client"
import { RefreshCcw } from "lucide-react"
import lz from "lzutf8"

import { Button } from "@/components/ui/button"
import type { getCategoriesWithItems } from "@/server/actions/item/queries"
import type { getMenuById } from "@/server/actions/menu/queries"
import difference from "@/lib/difference"

export default function SyncStatus({
  menu,
  categories
}: {
  menu: Prisma.PromiseReturnType<typeof getMenuById>
  categories: Prisma.PromiseReturnType<typeof getCategoriesWithItems>
}) {
  const [syncReq, setSyncReq] = useState(false)

  useEffect(() => {
    if (menu && menu?.serialData) {
      // Get Menu Items and check if update is necessary
      const serial = lz.decompress(lz.decodeBase64(menu?.serialData))
      const objectData = JSON.parse(serial)
      const menuCategories: Prisma.PromiseReturnType<
        typeof getCategoriesWithItems
      > = []
      let organization: Organization | null = null

      for (const property in objectData) {
        const component = objectData[property]
        if (component?.type?.resolvedName === "CategoryBlock") {
          menuCategories.push(component?.props?.data)
        }

        if (component?.type?.resolvedName === "HeaderBlock") {
          organization = component?.props?.organization
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

      // Check changed properties, exclude serialData and updatedAt
      let equalMenu = true
      if (organization) {
        const diff = difference(organization, menu.organization)
        // console.log("organization", organization)
        // console.log("menu.organization", menu.organization)
        console.log("diff", diff)
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

      console.log("equalData", equalData)
      console.log("equalMenu", equalMenu)
      setSyncReq(!equalData || !equalMenu)
    }
  }, [menu, categories, setSyncReq])

  return (
    <>
      {syncReq && (
        <div className="m-2 rounded-lg bg-violet-100 px-4 py-2">
          <div className="flex justify-between">
            <div className="flex items-center gap-x-3">
              <RefreshCcw className="size-4 text-violet-400" />
              <span className="text-sm text-violet-700">
                La información del menú fue actualizada, puedes sincronizar los
                cambios
              </span>
            </div>
            <Button variant="link" size="xs" className="text-violet-700">
              Actualizar
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
