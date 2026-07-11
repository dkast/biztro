import type { MenuData } from "@/lib/sync-status"

type SearchVariant = {
  id: string
  name: string | null
  price: number
}

export type PublicMenuSearchItem = {
  id: string
  name: string
  description: string | null
  image: string | null
  allergens: string | null
  currency?: string | null
  variants: SearchVariant[]
  categoryName?: string | null
}

type SourceItem =
  | MenuData["items"][number]
  | MenuData["featuredItems"][number]
  | MenuData["categories"][number]["menuItems"][number]

function toSearchItem(
  item: SourceItem,
  categoryName: string | null = null
): PublicMenuSearchItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? null,
    image: item.image ?? null,
    allergens: item.allergens ?? null,
    currency: "currency" in item ? (item.currency ?? null) : null,
    variants: item.variants.map(variant => ({
      id: variant.id,
      name: variant.name ?? null,
      price: Number(variant.price ?? 0)
    })),
    categoryName
  }
}

export function normalizePublicMenuItems(menuData: MenuData) {
  const itemsById = new Map<string, PublicMenuSearchItem>()

  const upsertItem = (item: SourceItem, categoryName: string | null = null) => {
    const normalizedItem = toSearchItem(item, categoryName)
    const existingItem = itemsById.get(normalizedItem.id)

    if (!existingItem) {
      itemsById.set(normalizedItem.id, normalizedItem)
      return
    }

    if (!existingItem.categoryName && normalizedItem.categoryName) {
      itemsById.set(normalizedItem.id, {
        ...existingItem,
        categoryName: normalizedItem.categoryName
      })
    }
  }

  for (const category of menuData.categories) {
    for (const item of category.menuItems) {
      upsertItem(item, category.name)
    }
  }

  for (const item of menuData.featuredItems) {
    upsertItem(item)
  }

  for (const item of menuData.items) {
    upsertItem(item)
  }

  return Array.from(itemsById.values())
}
