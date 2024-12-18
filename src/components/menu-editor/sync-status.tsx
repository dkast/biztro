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
  getFeaturedItems,
  getMenuItemsWithoutCategory
} from "@/server/actions/item/queries"
import type { getDefaultLocation } from "@/server/actions/location/queries"
import type { getMenuById } from "@/server/actions/menu/queries"
import difference from "@/lib/difference"

type MenuData = {
  categories: Prisma.PromiseReturnType<typeof getCategoriesWithItems>
  featuredItems: Prisma.PromiseReturnType<typeof getFeaturedItems>
  items: Prisma.PromiseReturnType<typeof getCategoriesWithItems>[0]["menuItems"]
  organization: Organization | null
  defaultLocation: Prisma.PromiseReturnType<typeof getDefaultLocation> | null
}

type MenuComponent = {
  type?: {
    resolvedName?: string
  }
}

function extractMenuData(serialData: string): MenuData {
  const serial = lz.decompress(lz.decodeBase64(serialData))
  const objectData = JSON.parse(serial)
  const menuData: MenuData = {
    categories: [],
    featuredItems: [],
    items: [],
    organization: null,
    defaultLocation: null
  }

  for (const property in objectData) {
    const component = objectData[property]
    switch (component?.type?.resolvedName) {
      case "CategoryBlock":
        menuData.categories.push(component?.props?.data)
        break
      case "HeaderBlock":
        menuData.organization = component?.props?.organization
        menuData.defaultLocation = component?.props?.location
        break
      case "FeaturedBlock":
        menuData.featuredItems.push(...(component?.props?.items || []))
        break
      case "ItemBlock":
        menuData.items.push(component?.props?.item)
        break
      default:
        break
    }
  }

  return menuData
}

function compareDates(date1: Date, date2: Date | string): boolean {
  return date1.getTime() === new Date(date2).getTime()
}

function compareCategories(
  menuCategories: MenuData["categories"],
  dbCategories: Prisma.PromiseReturnType<typeof getCategoriesWithItems>
): boolean {
  // Check existing categories
  const areCategoriesEqual = menuCategories.every(menuCategory => {
    console.log("menuCategory", menuCategory.name)
    const dbCategory = dbCategories.find(db => db.id === menuCategory.id)
    if (!dbCategory?.updatedAt) return false

    // Check if dbCategory still exists
    if (!dbCategory) return false

    const isCategoryEqual = compareDates(
      dbCategory.updatedAt,
      menuCategory.updatedAt
    )
    const areItemsEqual = dbCategory.menuItems.every(dbItem => {
      const menuItem = menuCategory.menuItems.find(
        menu => menu.id === dbItem.id
      )
      return (
        menuItem?.updatedAt &&
        compareDates(dbItem.updatedAt, menuItem.updatedAt)
      )
    })
    return isCategoryEqual && areItemsEqual
  })
  console.log("areCategoriesEqual", areCategoriesEqual)

  // Check for new items
  const hasNewItems = menuCategories.some(menuCategory => {
    const dbCategory = dbCategories.find(db => db.id === menuCategory.id)
    return (
      !dbCategory ||
      dbCategory.menuItems.some(
        dbItem =>
          !menuCategory.menuItems.find(menuItem => menuItem.id === dbItem.id)
      )
    )
  })
  console.log("hasNewItems", hasNewItems)

  // Check for items that were removed
  const hasRemovedItems = menuCategories.some(menuCategory => {
    const dbCategory = dbCategories.find(db => db.id === menuCategory.id)
    return (
      !dbCategory ||
      menuCategory.menuItems.some(
        menuItem =>
          !dbCategory.menuItems.find(dbItem => dbItem.id === menuItem.id)
      )
    )
  })
  console.log("hasRemovedItems", hasRemovedItems)

  return areCategoriesEqual && !hasNewItems && !hasRemovedItems
}

function compareFeaturedItems(
  menuItems: Prisma.PromiseReturnType<typeof getFeaturedItems>,
  dbItems: Prisma.PromiseReturnType<typeof getFeaturedItems>,
  serialData?: string
): boolean {
  if (!serialData) return false

  // Check if FeaturedBlock exists in menu data
  const serial = lz.decompress(lz.decodeBase64(serialData))
  const objectData = JSON.parse(serial)

  const hasFeaturedBlock = Object.values(objectData).some(
    component =>
      (component as MenuComponent)?.type?.resolvedName === "FeaturedBlock"
  )

  if (!hasFeaturedBlock) return true

  if (menuItems.length !== dbItems.length) return false

  // Check if both arrays are empty
  if (menuItems.length === 0 && dbItems.length === 0) return true

  return menuItems.every(menuItem => {
    const dbItem = dbItems.find(db => db.id === menuItem.id)
    return (
      dbItem?.updatedAt && compareDates(dbItem.updatedAt, menuItem.updatedAt)
    )
  })
}

function compareItems(
  menuItems: MenuData["items"],
  soloItems: Prisma.PromiseReturnType<typeof getMenuItemsWithoutCategory>
): boolean {
  if (menuItems.length === 0 && soloItems.length === 0) return true

  // Check if all menu items exist and are up to date in soloItems
  return menuItems.every(menuItem => {
    const dbItem = soloItems.find(db => db.id === menuItem.id)
    return (
      dbItem?.updatedAt && compareDates(dbItem.updatedAt, menuItem.updatedAt)
    )
  })
}

export default function SyncStatus({
  menu,
  location,
  categories,
  featuredItems,
  soloItems
}: {
  menu: Prisma.PromiseReturnType<typeof getMenuById>
  location: Prisma.PromiseReturnType<typeof getDefaultLocation> | null
  categories: Prisma.PromiseReturnType<typeof getCategoriesWithItems>
  featuredItems: Prisma.PromiseReturnType<typeof getFeaturedItems>
  soloItems: Prisma.PromiseReturnType<typeof getMenuItemsWithoutCategory>
}) {
  const { actions } = useEditor()
  const [syncReq, setSyncReq] = useState(false)

  useEffect(() => {
    if (!menu?.serialData) return

    const menuData = extractMenuData(menu.serialData)
    console.dir(menuData)

    const needsSync =
      !compareCategories(menuData.categories, categories) ||
      !compareFeaturedItems(
        menuData.featuredItems,
        featuredItems,
        menu.serialData
      ) ||
      !compareItems(menuData.items, soloItems)

    console.log(
      "Categories",
      !compareCategories(menuData.categories, categories)
    )
    console.log(
      "Featured",
      !compareFeaturedItems(
        menuData.featuredItems,
        featuredItems,
        menu.serialData
      )
    )
    console.log("needsSync", needsSync)
    setSyncReq(needsSync)

    // Check changed properties, exclude serialData and updatedAt
    let equalMenu = true
    if (menuData.organization) {
      const diff = difference(menuData.organization, menu.organization)
      console.log(diff)
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

    if (menuData.defaultLocation && !location) {
      equalMenu = false
    }

    if (!menuData.defaultLocation && location) {
      equalMenu = false
    }

    if (menuData.defaultLocation && location) {
      const diff = difference(menuData.defaultLocation, location)
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
        !menuData.defaultLocation.openingHours &&
        location.openingHours &&
        location.openingHours.length > 0
      ) {
        equalMenu = false
      }

      if (
        menuData.defaultLocation.openingHours &&
        menuData.defaultLocation.openingHours.length > 0
      ) {
        location.openingHours.forEach((entry, index) => {
          const diff = difference(
            menuData.defaultLocation?.openingHours?.[index] ?? {},
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

    if (!equalMenu) {
      setSyncReq(true)
    }
  }, [menu, categories, location, featuredItems, soloItems])

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

          // Check if a dbCategory has been removed
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
          const dbItem = soloItems.find(
            dbItem => dbItem.id === component?.props?.item.id
          )
          if (dbItem) {
            actions.setProp(property, props => {
              props.item = dbItem
            })
          }

          // Remove ItemBlock if item no longer exists
          if (!dbItem) {
            actions.delete(property)
          }
        }
      }

      toast.success("Información actualizada")
      setSyncReq(false)
    }
  }

  return (
    <>
      {syncReq && (
        <div className="m-2 rounded-lg bg-indigo-100 px-4 py-2 dark:bg-indigo-900/50">
          <div className="flex justify-between">
            <div className="flex items-center gap-x-3">
              <RefreshCcw className="size-4 text-indigo-400" />
              <span className="text-sm text-indigo-700 dark:text-indigo-300">
                La información del negocio o productos ha cambiado, puedes
                sincronizar para aplicar los últimos cambios
              </span>
            </div>
            <Button
              variant="link"
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
