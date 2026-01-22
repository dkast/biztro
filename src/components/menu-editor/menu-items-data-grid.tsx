"use client"

import * as React from "react"
import * as Sentry from "@sentry/nextjs"
import type { CellSelectOption } from "@/types/data-grid"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader } from "lucide-react"
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

// Runtime assertion helpers to ensure the invariant that single-variant
// items always have their `price` equal to `variants[0].price`. In
// development this throws to surface bugs early, and in production it logs
// an error.
function assertSingleVariantPriceSyncedRow(row: MenuItemRow) {
  if (row.variantCount === 1) {
    const v0 = row.variants[0]
    if (v0 && row.price !== v0.price) {
      const msg = `Invariant violation: single-variant item ${row.id} price (${row.price}) !== variants[0].price (${v0.price})`
      if (
        typeof process !== "undefined" &&
        process.env?.NODE_ENV === "development"
      ) {
        throw new Error(msg)
      } else {
        // Don't throw in production to avoid interrupting user flows, but log.

        console.error(msg)
        Sentry.captureMessage(msg, {
          level: "error",
          tags: { section: "menu-items-data-grid" }
        })
      }
    }
  }
}

function assertSingleVariantPrices(rows: MenuItemRow[]) {
  for (const r of rows) assertSingleVariantPriceSyncedRow(r)
}

function areMenuItemRowsEqual(a: MenuItemRow[], b: MenuItemRow[]) {
  if (a === b) return true
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {
    const rowA = a[i]
    const rowB = b[i]
    if (!rowA || !rowB) return false

    if (
      rowA.id !== rowB.id ||
      rowA.name !== rowB.name ||
      rowA.description !== rowB.description ||
      rowA.categoryId !== rowB.categoryId ||
      rowA.categoryName !== rowB.categoryName ||
      rowA.status !== rowB.status ||
      rowA.featured !== rowB.featured ||
      rowA.currency !== rowB.currency ||
      rowA.price !== rowB.price ||
      rowA.variantCount !== rowB.variantCount ||
      rowA.organizationId !== rowB.organizationId
    ) {
      return false
    }

    if (rowA.allergens.length !== rowB.allergens.length) return false
    for (let j = 0; j < rowA.allergens.length; j++) {
      if (rowA.allergens[j] !== rowB.allergens[j]) return false
    }

    if (rowA.variants.length !== rowB.variants.length) return false
    for (let j = 0; j < rowA.variants.length; j++) {
      const variantA = rowA.variants[j]
      const variantB = rowB.variants[j]
      if (
        !variantA ||
        !variantB ||
        variantA.id !== variantB.id ||
        variantA.name !== variantB.name ||
        variantA.price !== variantB.price ||
        variantA.description !== variantB.description ||
        variantA.menuItemId !== variantB.menuItemId
      ) {
        return false
      }
    }
  }

  return true
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
  // Flatten items into grid rows - this is the source of truth from props
  const initialData = React.useMemo(() => {
    const rows = flattenMenuItems(
      categories,
      soloItems,
      featuredItems,
      organizationId
    )
    assertSingleVariantPrices(rows)
    return rows
  }, [categories, soloItems, featuredItems, organizationId])

  // Store only the edits as an overlay on top of initialData
  // Key: item id, Value: edited row data
  const [edits, setEdits] = React.useState<Map<string, MenuItemRow>>(new Map())

  // Compute display data: initialData with edits applied
  const data = React.useMemo(() => {
    if (edits.size === 0) return initialData
    return initialData.map(row => edits.get(row.id) ?? row)
  }, [initialData, edits])

  // Dirty IDs derived from edits
  const dirtyIds = React.useMemo(() => new Set(edits.keys()), [edits])

  const [pendingDirtySnapshot, setPendingDirtySnapshot] = React.useState<{
    isDirty: boolean
    items: MenuItemRow[]
  } | null>(null)

  const onDirtyChangeRef = React.useRef(onDirtyChange)

  React.useEffect(() => {
    onDirtyChangeRef.current = onDirtyChange
  }, [onDirtyChange])

  React.useEffect(() => {
    if (!pendingDirtySnapshot) return
    onDirtyChangeRef.current?.(
      pendingDirtySnapshot.isDirty,
      pendingDirtySnapshot.items
    )
    setPendingDirtySnapshot(null)
  }, [pendingDirtySnapshot])

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
      if (isSaving) return

      // Build a map of original rows by id for comparison
      const originalById = new Map(initialData.map(row => [row.id, row]))

      // Find which rows have changed from their original values
      const newEdits = new Map<string, MenuItemRow>()

      for (const row of newData) {
        // Normalize price field
        const safePrice =
          typeof row.price === "number" && !Number.isNaN(row.price)
            ? row.price
            : 0

        let normalizedRow = row
        if (row.variantCount === 1) {
          const variant0 = row.variants[0]
          if (variant0 && variant0.price !== safePrice) {
            const nextVariants = [...row.variants]
            nextVariants[0] = { ...variant0, price: safePrice }
            normalizedRow = { ...row, price: safePrice, variants: nextVariants }
          } else if (safePrice !== row.price) {
            normalizedRow = { ...row, price: safePrice }
          }
        } else if (safePrice !== row.price) {
          normalizedRow = { ...row, price: safePrice }
        }

        const original = originalById.get(normalizedRow.id)
        if (!original) continue

        // Check if this row differs from original
        const isDifferent = !areMenuItemRowsEqual([normalizedRow], [original])

        if (isDifferent) {
          newEdits.set(normalizedRow.id, { ...normalizedRow, _isDirty: true })
        }
      }

      // Only update state if edits actually changed
      setEdits(prevEdits => {
        const prevKeys = Array.from(prevEdits.keys()).sort().join(",")
        const newKeys = Array.from(newEdits.keys()).sort().join(",")

        if (prevKeys === newKeys) {
          // Same keys - check if values changed
          let valuesEqual = true
          for (const [id, newRow] of newEdits) {
            const prevRow = prevEdits.get(id)
            if (!prevRow || !areMenuItemRowsEqual([prevRow], [newRow])) {
              valuesEqual = false
              break
            }
          }
          if (valuesEqual) return prevEdits
        }

        // Defer parent update to avoid setState during render
        const dirtyItems = Array.from(newEdits.values())
        setPendingDirtySnapshot({
          isDirty: newEdits.size > 0,
          items: dirtyItems
        })

        return newEdits
      })
    },
    [initialData, isSaving, onDirtyChange]
  )

  // Open variants dialog
  const handleEditVariants = React.useCallback((row: MenuItemRow) => {
    setSelectedItemForVariants(row)
    setVariantsDialogOpen(true)
  }, [])

  // Update variants from dialog
  const handleVariantsUpdate = React.useCallback(
    (itemId: string, variants: MenuItemRow["variants"]) => {
      const original = initialData.find(row => row.id === itemId)
      if (!original) return

      const updatedRow: MenuItemRow = {
        ...original,
        ...edits.get(itemId),
        variants,
        variantCount: variants.length,
        price: variants[0]?.price ?? original.price,
        _isDirty: true
      }

      setEdits(prev => {
        const next = new Map(prev)
        next.set(itemId, updatedRow)

        // Defer parent update to avoid setState during render
        const dirtyItems = Array.from(next.values())
        setPendingDirtySnapshot({ isDirty: true, items: dirtyItems })

        return next
      })

      setVariantsDialogOpen(false)
    },
    [initialData, edits, onDirtyChange]
  )

  const handleManualSave = React.useCallback(async () => {
    if (edits.size === 0) return

    const dirtyItems = Array.from(edits.values())
    if (!onManualSave) return

    const result = await onManualSave(dirtyItems)
    const success = result ?? true

    if (success) {
      // Clear edits after successful save
      setEdits(new Map())
      setPendingDirtySnapshot({ isDirty: false, items: [] })
    }
  }, [edits, onDirtyChange, onManualSave])

  const handleDiscardChanges = React.useCallback(() => {
    if (edits.size === 0) return

    setEdits(new Map())
    setSelectedItemForVariants(null)
    setVariantsDialogOpen(false)
    setPendingDirtySnapshot({ isDirty: false, items: [] })
  }, [edits.size, onDirtyChange])

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
    enableSearch: true,
    readOnly: isSaving
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
          <div className="flex items-center gap-3">
            <h2 className="px-2 py-3">Editar Productos del menú</h2>
            <AnimatePresence initial={true} mode="wait">
              {isSaving && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  className="text-muted-foreground flex items-center gap-1
                    text-xs"
                >
                  <Loader className="size-4 animate-spin" />
                  Guardando...
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2">
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
