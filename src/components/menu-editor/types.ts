// Shared types for menu editor components

import type {
  getCategoriesWithItems,
  getFeaturedItems,
  getMenuItemsWithoutCategory
} from "@/server/actions/item/queries"

// MenuItem row type for the grid - flattened for editing
export interface MenuItemRow {
  id: string
  name: string
  description: string | null
  categoryId: string | null
  categoryName: string | null
  status: "ACTIVE" | "DRAFT" | "ARCHIVED"
  featured: boolean
  currency: "MXN" | "USD"
  // For single-variant items, we edit price directly; for multi-variant, show button
  price: number
  variantCount: number
  variants: Array<{
    id: string
    name: string
    price: number
    description?: string | null
    menuItemId: string
  }>
  organizationId: string
  // Track if this row has been modified
  _isDirty?: boolean
}

export interface MenuItemsDataGridProps {
  categories: Awaited<ReturnType<typeof getCategoriesWithItems>>
  soloItems: Awaited<ReturnType<typeof getMenuItemsWithoutCategory>>
  featuredItems: Awaited<ReturnType<typeof getFeaturedItems>>
  organizationId: string
  onDirtyChange?: (isDirty: boolean, dirtyItems?: MenuItemRow[]) => void
  isSaving?: boolean
  onManualSave?: (dirtyItems: MenuItemRow[]) => Promise<boolean | void>
}

export interface MenuItemsDataGridRef {
  getDirtyItems: () => MenuItemRow[]
  clearDirty: () => void
}
