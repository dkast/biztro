"use client"

import * as React from "react"
import type { CellSelectOption } from "@/types/data-grid"
import type { ColumnDef } from "@tanstack/react-table"
import { Pencil } from "lucide-react"

import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridKeyboardShortcuts } from "@/components/data-grid/data-grid-keyboard-shortcuts"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useDataGrid } from "@/hooks/use-data-grid"
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
    if (itemMap.has(item.id)) return

    itemMap.set(item.id, {
      id: item.id,
      name: item.name,
      description: item.description,
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
    })
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
  isSaving
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

  // Dialog for editing variants
  const [variantsDialogOpen, setVariantsDialogOpen] = React.useState(false)
  const [selectedItemForVariants, setSelectedItemForVariants] =
    React.useState<MenuItemRow | null>(null)

  // Build category options for select cell
  const categoryOptions: CellSelectOption[] = React.useMemo(() => {
    const opts: CellSelectOption[] = [{ label: "Sin categoría", value: "" }]
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

  // Handle data changes from grid
  const handleDataChange = React.useCallback(
    (newData: MenuItemRow[]) => {
      // Find which rows changed
      const newDirtyIds = new Set(dirtyIds)
      for (let i = 0; i < newData.length; i++) {
        const newRow = newData[i]
        const oldRow = data[i]
        if (
          newRow &&
          oldRow &&
          JSON.stringify(newRow) !== JSON.stringify(oldRow)
        ) {
          newDirtyIds.add(newRow.id)
          newRow._isDirty = true
        }
      }
      setDirtyIds(newDirtyIds)
      setData(newData)

      // Pass dirty items to parent
      const dirtyItems = newData.filter(row => newDirtyIds.has(row.id))
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
        cell: ({ row }) => {
          const item = row.original
          // If multiple variants, show button to open dialog
          if (item.variantCount > 1) {
            return (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  {item.variantCount} variantes
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={e => {
                    e.stopPropagation()
                    handleEditVariants(item)
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
            )
          }
          // Single variant: render price as number cell via default
          return null // Let the default number cell render
        },
        meta: {
          label: "Precio",
          cell: {
            variant: "number" as const,
            min: 0,
            step: 0.01
          }
        }
      }
    ],
    [categoryOptions, statusOptions, currencyOptions, handleEditVariants]
  )

  const { table, ...dataGridProps } = useDataGrid({
    data,
    columns,
    onDataChange: handleDataChange,
    getRowId: row => row.id
  })

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">
            Editar productos ({data.length})
          </h3>
          <div className="flex items-center gap-2">
            {isSaving && (
              <span
                className="text-muted-foreground flex items-center gap-1
                  text-xs"
              >
                <span
                  className="h-3 w-3 animate-spin rounded-full border-2
                    border-current border-t-transparent"
                />
                Guardando...
              </span>
            )}
            {!isSaving && dirtyIds.size > 0 && (
              <span className="text-muted-foreground text-xs">
                {dirtyIds.size} cambio{dirtyIds.size > 1 ? "s" : ""} sin guardar
              </span>
            )}
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
          <DataGridKeyboardShortcuts />
          <DataGrid
            table={table}
            {...dataGridProps}
            height={undefined}
            stretchColumns
            className="h-full"
          />
        </TooltipProvider>
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
