"use client"

import * as React from "react"
import type { CellSelectOption } from "@/types/data-grid"
import type { ColumnDef } from "@tanstack/react-table"
import { AnimatePresence, motion } from "motion/react"

import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridFilterMenu } from "@/components/data-grid/data-grid-filter-menu"
import { DataGridKeyboardShortcuts } from "@/components/data-grid/data-grid-keyboard-shortcuts"
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu"
import { Button } from "@/components/ui/button"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useDataGrid } from "@/hooks/use-data-grid"
import { Allergens } from "@/lib/types"
import { cn } from "@/lib/utils"
import type { MenuItemRow, MenuItemsDataGridProps } from "./types"
import { VariantsEditDialog } from "./variants-edit-dialog"

// Re-export types for consumers
export type { MenuItemRow, MenuItemsDataGridProps } from "./types"
export type { MenuItemsDataGridRef } from "./types"

// Flatten all menu items from categories, solo items, and featured items into a single array
function flattenMenuItems(
  categories: MenuItemsDataGridProps["categories"],
  soloItems: MenuItemsDataGridProps["soloItems"],
  featuredItems: MenuItemsDataGridProps["featuredItems"],
  organizationId: string
): MenuItemRow[] {
  const parseAllergens = (value?: string | null) =>
    (value ?? "")
      .split(",")
      .map(entry => entry.trim())
      .filter(Boolean)

  const itemMap = new Map<string, MenuItemRow>()

  // Helper to add item to map (deduplicates by id)
  const addItem = (
    item: {
      id: string
      name: string
      description: string | null
      categoryId?: string | null
      status: string
      featured: boolean
      currency: string | null
      allergens?: string | null
      organizationId: string
      variants: {
        id: string
        name: string
        price: number
        description?: string | null
        menuItemId: string
      }[]
    },
    categoryName: string | null
  ) => {
    const nextRow: MenuItemRow = {
      id: item.id,
      name: item.name,
      description: item.description,
      allergens: parseAllergens(item.allergens),
      categoryId: item.categoryId ?? null,
      categoryName,
      status: item.status as "ACTIVE" | "DRAFT" | "ARCHIVED",
      featured: item.featured,
      currency: (item.currency as "MXN" | "USD") ?? "MXN",
      price: item.variants[0]?.price ?? 0,
      variantCount: item.variants.length,
      variants: item.variants.map(v => ({
        id: v.id,
        name: v.name,
        price: v.price,
        description: v.description ?? null,
        menuItemId: v.menuItemId
      })),
      organizationId: item.organizationId || organizationId
    }

    const existing = itemMap.get(item.id)
    if (!existing) {
      itemMap.set(item.id, nextRow)
      return
    }

    // Merge duplicates: keep the most complete variant list and avoid losing category info.
    // This matters because some queries may include only the first variant.
    const shouldTakeVariants = nextRow.variantCount > existing.variantCount
    const merged: MenuItemRow = {
      ...existing,
      // Prefer a known category name/id over null.
      categoryId: existing.categoryId ?? nextRow.categoryId,
      categoryName: existing.categoryName ?? nextRow.categoryName,
      // Prefer the "featured" flag if any source says it is featured.
      featured: existing.featured || nextRow.featured,
      // Keep currency if missing on existing.
      currency: existing.currency ?? nextRow.currency,
      // Prefer the most complete allergens list.
      allergens:
        existing.allergens.length > 0 ? existing.allergens : nextRow.allergens,
      // Prefer the more complete variants payload.
      variants: shouldTakeVariants ? nextRow.variants : existing.variants,
      variantCount: shouldTakeVariants
        ? nextRow.variantCount
        : existing.variantCount,
      price: shouldTakeVariants ? nextRow.price : existing.price
    }

    itemMap.set(item.id, merged)
  }

  // Add items from categories
  for (const category of categories) {
    for (const item of category.menuItems) {
      addItem(item as unknown as Parameters<typeof addItem>[0], category.name)
    }
  }

  // Add solo items (without category)
  for (const item of soloItems) {
    addItem(item as unknown as Parameters<typeof addItem>[0], null)
  }

  // Add featured items (may overlap with above)
  for (const item of featuredItems) {
    addItem(item as unknown as Parameters<typeof addItem>[0], null)
  }

  return Array.from(itemMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  )
}

export function MenuItemsDataGrid({
  categories,
  soloItems,
  featuredItems,
  organizationId,
  onDirtyChange,
  isSaving,
  onManualSave
}: MenuItemsDataGridProps) {
  // Flatten items into grid rows
  const initialData = React.useMemo(
    () =>
      flattenMenuItems(categories, soloItems, featuredItems, organizationId),
    [categories, soloItems, featuredItems, organizationId]
  )

  // Local state for grid data with dirty tracking
  const [data, setData] = React.useState<MenuItemRow[]>(initialData)
  const [dirtyIds, setDirtyIds] = React.useState<Set<string>>(new Set())

  // Resync data when initialData changes (only if no dirty edits)
  React.useEffect(() => {
    if (dirtyIds.size === 0) {
      setData(initialData)
    }
  }, [initialData, dirtyIds.size])

  // Dialog for editing variants
  const [variantsDialogOpen, setVariantsDialogOpen] = React.useState(false)
  const [selectedItemForVariants, setSelectedItemForVariants] =
    React.useState<MenuItemRow | null>(null)

  // Build category options for select cell
  const categoryOptions: CellSelectOption[] = React.useMemo(() => {
    const opts: CellSelectOption[] = []
    for (const cat of categories) {
      opts.push({ label: cat.name, value: cat.id })
    }
    return opts
  }, [categories])

  // Status options
  const statusOptions: CellSelectOption[] = React.useMemo(
    () => [
      { label: "Activo", value: "ACTIVE" },
      { label: "Borrador", value: "DRAFT" },
      { label: "Archivado", value: "ARCHIVED" }
    ],
    []
  )

  // Currency options
  const currencyOptions: CellSelectOption[] = React.useMemo(
    () => [
      { label: "MXN", value: "MXN" },
      { label: "USD", value: "USD" }
    ],
    []
  )

  const allergenOptions: CellSelectOption[] = React.useMemo(
    () =>
      Allergens.map(allergen => ({
        label: allergen.label,
        value: allergen.value
      })),
    []
  )

  // Handle data changes from grid
  const handleDataChange = React.useCallback(
    (newData: MenuItemRow[]) => {
      // Normalize/sync derived fields.
      // IMPORTANT: edits to `price` must update the underlying `variants[0].price`
      // because the save payload uses `variants`, not `price`.
      const prevById = new Map(data.map(row => [row.id, row]))
      const normalizedData = newData.map(row => {
        const safePrice =
          typeof row.price === "number" && !Number.isNaN(row.price)
            ? row.price
            : 0

        if (row.variantCount !== 1) {
          return safePrice === row.price ? row : { ...row, price: safePrice }
        }

        const variant0 = row.variants[0]
        if (!variant0) {
          return safePrice === row.price ? row : { ...row, price: safePrice }
        }

        const needsVariantSync = variant0.price !== safePrice
        const needsPriceSync = safePrice !== row.price
        if (!needsVariantSync && !needsPriceSync) return row

        const nextVariants = [...row.variants]
        nextVariants[0] = { ...variant0, price: safePrice }
        return {
          ...row,
          price: safePrice,
          variants: nextVariants
        }
      })

      // Find which rows changed (compare by id to be robust to sorting/filtering)
      const newDirtyIds = new Set(dirtyIds)
      const nextDataWithDirty = normalizedData.map(row => {
        const prev = prevById.get(row.id)
        if (prev && JSON.stringify(row) !== JSON.stringify(prev)) {
          newDirtyIds.add(row.id)
          return { ...row, _isDirty: true }
        }
        return row
      })

      setDirtyIds(newDirtyIds)
      setData(nextDataWithDirty)

      // Pass dirty items to parent
      const dirtyItems = nextDataWithDirty.filter(row =>
        newDirtyIds.has(row.id)
      )
      onDirtyChange?.(newDirtyIds.size > 0, dirtyItems)
    },
    [data, dirtyIds, onDirtyChange]
  )

  // Open variants dialog
  const handleEditVariants = React.useCallback((row: MenuItemRow) => {
    setSelectedItemForVariants(row)
    setVariantsDialogOpen(true)
  }, [])

  // Update variants from dialog
  const handleVariantsUpdate = React.useCallback(
    (itemId: string, variants: MenuItemRow["variants"]) => {
      setData(prev => {
        const updated = prev.map(row =>
          row.id === itemId
            ? {
                ...row,
                variants,
                variantCount: variants.length,
                price: variants[0]?.price ?? row.price,
                _isDirty: true
              }
            : row
        )

        // Pass dirty items to parent
        const newDirtyIds = new Set([...dirtyIds, itemId])
        setDirtyIds(newDirtyIds)
        const dirtyItems = updated.filter(row => newDirtyIds.has(row.id))
        onDirtyChange?.(true, dirtyItems)

        return updated
      })
      setVariantsDialogOpen(false)
    },
    [dirtyIds, onDirtyChange]
  )

  const handleManualSave = React.useCallback(async () => {
    if (dirtyIds.size === 0) return

    const dirtyItems = data.filter(row => dirtyIds.has(row.id))
    if (!onManualSave) return
    const result = await onManualSave(dirtyItems)
    const success = result ?? true

    if (success) {
      setDirtyIds(new Set())
      setData(prev => prev.map(row => ({ ...row, _isDirty: undefined })))
      onDirtyChange?.(false, [])
    }
  }, [data, dirtyIds, onDirtyChange, onManualSave])

  const handleDiscardChanges = React.useCallback(() => {
    if (dirtyIds.size === 0) return

    setData(initialData)
    setDirtyIds(new Set())
    setSelectedItemForVariants(null)
    setVariantsDialogOpen(false)
    onDirtyChange?.(false, [])
  }, [dirtyIds, initialData, onDirtyChange])

  // Column definitions
  const columns: ColumnDef<MenuItemRow>[] = React.useMemo(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Nombre",
        size: 200,
        minSize: 150,
        meta: {
          label: "Nombre",
          cell: { variant: "short-text" as const }
        }
      },
      {
        id: "description",
        accessorKey: "description",
        header: "Descripción",
        size: 250,
        minSize: 150,
        meta: {
          label: "Descripción",
          cell: { variant: "long-text" as const }
        }
      },
      {
        id: "allergens",
        accessorKey: "allergens",
        header: "Alérgenos",
        size: 200,
        minSize: 140,
        meta: {
          label: "Alérgenos",
          cell: {
            variant: "multi-select" as const,
            options: allergenOptions
          }
        }
      },
      {
        id: "categoryId",
        accessorKey: "categoryId",
        header: "Categoría",
        size: 150,
        minSize: 100,
        meta: {
          label: "Categoría",
          cell: {
            variant: "select" as const,
            options: categoryOptions
          }
        }
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Estado",
        size: 120,
        minSize: 100,
        meta: {
          label: "Estado",
          cell: {
            variant: "select" as const,
            options: statusOptions
          }
        }
      },
      {
        id: "featured",
        accessorKey: "featured",
        header: "Destacado",
        size: 100,
        minSize: 80,
        meta: {
          label: "Destacado",
          cell: { variant: "checkbox" as const }
        }
      },
      {
        id: "currency",
        accessorKey: "currency",
        header: "Moneda",
        size: 100,
        minSize: 80,
        meta: {
          label: "Moneda",
          cell: {
            variant: "select" as const,
            options: currencyOptions
          }
        }
      },
      {
        id: "price",
        accessorKey: "price",
        header: "Precio",
        size: 120,
        minSize: 100,
        meta: {
          label: "Precio",
          cell: {
            variant: "price" as const,
            min: 0,
            step: 0.01
          }
        }
      }
    ],
    [categoryOptions, statusOptions, currencyOptions, allergenOptions]
  )

  const { table, ...dataGridProps } = useDataGrid({
    data,
    columns,
    onDataChange: handleDataChange,
    getRowId: row => row.id,
    meta: {
      onPriceCellAction: handleEditVariants
    },
    enableSearch: true
  })

  const isMac =
    typeof navigator !== "undefined"
      ? /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
      : false

  const modKey = isMac ? "⌘" : "Ctrl"

  return (
    <div className="flex h-full flex-col px-3">
      <div className="py-2">
        <div className="flex items-center justify-between">
          <h2 className="px-2 py-3">Editar Productos del menú</h2>
          <div className="flex items-center gap-2">
            <AnimatePresence initial={false} mode="wait">
              {isSaving && (
                <motion.span
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-muted-foreground flex items-center gap-1
                    text-xs"
                >
                  <span
                    className="h-3 w-3 animate-spin rounded-full border-2
                      border-current border-t-transparent"
                  />
                  Guardando...
                </motion.span>
              )}
            </AnimatePresence>
            <AnimatePresence initial={false} mode="wait">
              {!isSaving && dirtyIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-muted-foreground text-xs">
                    {dirtyIds.size} cambio{dirtyIds.size > 1 ? "s" : ""} sin
                    guardar
                  </span>

                  <Button
                    size="xs"
                    variant="ghost"
                    disabled={dirtyIds.size === 0 || isSaving}
                    onClick={handleDiscardChanges}
                  >
                    Descartar cambios
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    disabled={dirtyIds.size === 0 || isSaving}
                    onClick={handleManualSave}
                  >
                    Guardar
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <DataGridFilterMenu table={table} />
            <DataGridViewMenu table={table} />
          </div>
        </div>
      </div>
      <div
        className={cn(
          "flex-1 overflow-hidden",
          isSaving && "pointer-events-none opacity-50"
        )}
      >
        <TooltipProvider>
          <DataGridKeyboardShortcuts enableSearch />
          <DataGrid
            table={table}
            {...dataGridProps}
            height={undefined}
            columns={columns}
            stretchColumns
          />
        </TooltipProvider>
        <div className="px-2 py-1">
          <span className="text-muted-foreground text-xs">
            Presiona <Kbd>Enter</Kbd> para iniciar cambios en una celda,{" "}
            <Kbd>Esc</Kbd> para cancelar la edición.
            <br />
            Presiona{" "}
            <KbdGroup>
              <Kbd>{modKey}</Kbd> + <Kbd>/</Kbd>
            </KbdGroup>{" "}
            para mostrar la lista completa de comandos.
          </span>
        </div>
      </div>

      {/* Variants Edit Dialog */}
      <VariantsEditDialog
        open={variantsDialogOpen}
        onOpenChange={setVariantsDialogOpen}
        item={selectedItemForVariants}
        onSave={handleVariantsUpdate}
      />
    </div>
  )
}
