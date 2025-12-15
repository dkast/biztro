import type { Organization } from "@/generated/prisma-client/client"
import lz from "lzutf8"

import type {
  getCategoriesWithItems,
  getFeaturedItems,
  getMenuItemsWithoutCategory
} from "@/server/actions/item/queries"
import type { getDefaultLocation } from "@/server/actions/location/queries"

type MenuComponent = {
  type?: {
    resolvedName?: string
  }
  props?: Record<string, unknown>
}

type MenuNodeMap = Record<string, MenuComponent>

export type MenuData = {
  categories: Awaited<ReturnType<typeof getCategoriesWithItems>>
  featuredItems: Awaited<ReturnType<typeof getFeaturedItems>>
  items: Awaited<ReturnType<typeof getCategoriesWithItems>>[0]["menuItems"]
  organization: Organization | null
  defaultLocation: Awaited<ReturnType<typeof getDefaultLocation>> | null
  hasFeaturedBlock: boolean
  hasHeaderBlock: boolean
}

export function decodeMenuNodes(serialData?: string | null) {
  if (!serialData) {
    return null
  }

  try {
    const serial = lz.decompress(lz.decodeBase64(serialData))
    return JSON.parse(serial) as MenuNodeMap
  } catch (error) {
    console.error("Failed to decode menu serial data", error)
    return null
  }
}

export function extractMenuDataFromNodes(nodes: MenuNodeMap): MenuData {
  const menuData: MenuData = {
    categories: [],
    featuredItems: [],
    items: [],
    organization: null,
    defaultLocation: null,
    hasFeaturedBlock: false,
    hasHeaderBlock: false
  }

  for (const property in nodes) {
    const component = nodes[property]
    switch (component?.type?.resolvedName) {
      case "CategoryBlock": {
        const categoryData = component?.props?.data as
          | MenuData["categories"][number]
          | undefined
        if (categoryData) {
          menuData.categories.push(categoryData)
        }
        break
      }
      case "HeaderBlock": {
        menuData.hasHeaderBlock = true
        const headerLocation = component?.props?.location as
          | MenuData["defaultLocation"]
          | undefined
        if (headerLocation) {
          menuData.defaultLocation = headerLocation
        }
        const organization = component?.props?.organization as
          | MenuData["organization"]
          | undefined
        if (organization) {
          menuData.organization = organization
        }
        break
      }
      case "FeaturedBlock": {
        menuData.hasFeaturedBlock = true
        const items = component?.props?.items as
          | MenuData["featuredItems"]
          | undefined
        if (items?.length) {
          menuData.featuredItems.push(...items)
        }
        break
      }
      case "ItemBlock": {
        const item = component?.props?.item as
          | MenuData["items"][number]
          | undefined
        if (item) {
          menuData.items.push(item)
        }
        break
      }
      default:
        break
    }
  }

  return menuData
}

function toTimestamp(value?: string | Date | null) {
  if (!value) {
    return null
  }
  return typeof value === "string" ? new Date(value).getTime() : value.getTime()
}

function compareDates(
  date1?: string | Date | null,
  date2?: string | Date | null
) {
  const first = toTimestamp(date1)
  const second = toTimestamp(date2)
  if (first === null || second === null) {
    return false
  }
  return first === second
}

type VariantLike = {
  id: string
  updatedAt?: string | Date | null
  name?: string | null
  price?: number | null
}

type ItemLike = {
  id: string
  updatedAt?: string | Date | null
  variants?: VariantLike[] | null
}

function getVariantSignature(variant: VariantLike | null | undefined) {
  if (!variant) return ""
  return [
    variant.id,
    variant.name ?? "",
    variant.price ?? "",
    toTimestamp(variant.updatedAt) ?? ""
  ].join("|")
}

function getVariantsSignature(variants?: VariantLike[] | null) {
  if (!variants?.length) {
    return ""
  }
  return variants
    .map(getVariantSignature)
    .filter(signature => signature)
    .sort()
    .join(";")
}

function getItemSignature(item?: ItemLike | null) {
  if (!item) return ""
  const updated = toTimestamp(item.updatedAt)
  return `${updated ?? ""}:${getVariantsSignature(item.variants)}`
}

function areItemSignaturesEqual(
  menuItem: ItemLike | null,
  dbItem: ItemLike | null
) {
  if (!menuItem || !dbItem) {
    return false
  }
  return getItemSignature(menuItem) === getItemSignature(dbItem)
}

function areCategoryItemsSynced(
  menuItems: MenuData["categories"][number]["menuItems"],
  dbItems: MenuData["categories"][number]["menuItems"]
) {
  if (menuItems.length !== dbItems.length) {
    return false
  }

  const dbIndex = new Map(dbItems.map(item => [item.id, item]))
  for (const menuItem of menuItems) {
    const dbItem = dbIndex.get(menuItem.id)
    if (!dbItem || !areItemSignaturesEqual(menuItem, dbItem)) {
      return false
    }
  }

  return true
}

export function areCategoriesInSync(
  menuCategories: MenuData["categories"],
  dbCategories: MenuData["categories"]
) {
  if (!menuCategories.length) {
    return true
  }

  for (const menuCategory of menuCategories) {
    const dbCategory = dbCategories.find(db => db.id === menuCategory.id)
    if (!dbCategory || !dbCategory.updatedAt || !menuCategory.updatedAt) {
      return false
    }

    if (!compareDates(dbCategory.updatedAt, menuCategory.updatedAt)) {
      return false
    }

    if (!areCategoryItemsSynced(menuCategory.menuItems, dbCategory.menuItems)) {
      return false
    }
  }

  return true
}

export function areFeaturedItemsInSync(
  menuItems: MenuData["featuredItems"],
  dbItems: MenuData["featuredItems"],
  hasFeaturedBlock: boolean
) {
  if (!hasFeaturedBlock) {
    return true
  }

  if (menuItems.length !== dbItems.length) {
    return false
  }

  const dbIndex = new Map(dbItems.map(item => [item.id, item]))
  for (const menuItem of menuItems) {
    const dbItem = dbIndex.get(menuItem.id)
    if (!dbItem || !areItemSignaturesEqual(menuItem, dbItem)) {
      return false
    }
  }

  return true
}

export function areSoloItemsInSync(
  menuItems: MenuData["items"],
  soloItems: Awaited<ReturnType<typeof getMenuItemsWithoutCategory>>
) {
  if (!menuItems.length) {
    return true
  }

  const soloIndex = new Map(soloItems.map(item => [item.id, item]))
  for (const menuItem of menuItems) {
    const dbItem = soloIndex.get(menuItem.id)
    if (!dbItem || !areItemSignaturesEqual(menuItem, dbItem)) {
      return false
    }
  }

  return true
}

const locationStringFields = [
  "address",
  "phone",
  "facebook",
  "instagram",
  "twitter",
  "tiktok",
  "whatsapp",
  "website",
  "currency"
] as const
const locationBooleanFields = [
  "serviceDelivery",
  "serviceTakeout",
  "serviceDineIn"
] as const
const locationNumberFields = ["deliveryFee"] as const

type LocationField =
  | (typeof locationStringFields)[number]
  | (typeof locationBooleanFields)[number]
  | (typeof locationNumberFields)[number]

function normalizeLocationString(value: unknown) {
  if (typeof value === "string") {
    return value
  }
  return value ?? null
}

function normalizeLocationBoolean(value: unknown) {
  return value === true
}

function normalizeLocationNumber(value: unknown) {
  return typeof value === "number" ? value : 0
}

function valuesMatch(valueA: unknown, valueB: unknown) {
  return valueA === valueB
}

type OpeningHoursEntry = {
  day?: string | null
  startTime?: string | null
  endTime?: string | null
  allDay?: boolean | null
}

type NormalizedOpeningHours = {
  day: string
  startTime: string | null
  endTime: string | null
  allDay: boolean
}

function normalizeOpeningHours(
  entries?: OpeningHoursEntry[] | null
): Map<string, NormalizedOpeningHours> {
  const map = new Map<string, NormalizedOpeningHours>()

  for (const entry of entries ?? []) {
    if (!entry?.day) continue
    map.set(entry.day, {
      day: entry.day,
      startTime: entry.startTime ?? null,
      endTime: entry.endTime ?? null,
      allDay: entry.allDay === true
    })
  }

  return map
}

function areOpeningHoursEqual(
  menuHours?: OpeningHoursEntry[] | null,
  dbHours?: OpeningHoursEntry[] | null
) {
  const menuMap = normalizeOpeningHours(menuHours)
  const dbMap = normalizeOpeningHours(dbHours)

  if (menuMap.size !== dbMap.size) {
    return false
  }

  for (const [day, menuEntry] of menuMap.entries()) {
    const dbEntry = dbMap.get(day)
    if (!dbEntry) {
      return false
    }

    if (menuEntry.allDay !== dbEntry.allDay) {
      return false
    }

    if (menuEntry.startTime !== dbEntry.startTime) {
      return false
    }

    if (menuEntry.endTime !== dbEntry.endTime) {
      return false
    }
  }

  return true
}

export function areOrganizationsInSync(
  menuOrganization: MenuData["organization"],
  dbOrganization: Organization | null | undefined
) {
  if (!menuOrganization && !dbOrganization) {
    return true
  }

  if (Boolean(menuOrganization) !== Boolean(dbOrganization)) {
    return false
  }

  const menuFields = menuOrganization as Record<string, unknown>
  const dbFields = dbOrganization as Record<string, unknown>

  for (const field of ["banner", "logo", "name"] as const) {
    const menuValue = normalizeLocationString(menuFields[field])
    const dbValue = normalizeLocationString(dbFields[field])
    if (!valuesMatch(menuValue, dbValue)) {
      return false
    }
  }

  return true
}

export function areLocationsInSync(
  menuLocation: MenuData["defaultLocation"],
  dbLocation: Awaited<ReturnType<typeof getDefaultLocation>> | null
) {
  if (!menuLocation && !dbLocation) {
    return true
  }

  if (Boolean(menuLocation) !== Boolean(dbLocation)) {
    return false
  }

  const menuFields = menuLocation as Record<LocationField, unknown>
  const dbFields = dbLocation as Record<LocationField, unknown>

  for (const field of locationStringFields) {
    const menuValue = normalizeLocationString(menuFields[field])
    const dbValue = normalizeLocationString(dbFields[field])
    if (!valuesMatch(menuValue, dbValue)) {
      return false
    }
  }

  for (const field of locationBooleanFields) {
    const menuValue = normalizeLocationBoolean(menuFields[field])
    const dbValue = normalizeLocationBoolean(dbFields[field])
    if (!valuesMatch(menuValue, dbValue)) {
      return false
    }
  }

  for (const field of locationNumberFields) {
    const menuValue = normalizeLocationNumber(menuFields[field])
    const dbValue = normalizeLocationNumber(dbFields[field])
    if (!valuesMatch(menuValue, dbValue)) {
      return false
    }
  }

  return areOpeningHoursEqual(
    menuLocation?.openingHours,
    dbLocation?.openingHours
  )
}
