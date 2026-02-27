"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import toast from "react-hot-toast"
import type { CellSelectOption } from "@/types/data-grid"
import * as Sentry from "@sentry/nextjs"
import type { ColumnDef } from "@tanstack/react-table"
import {
  AlertCircle,
  FileText,
  Loader,
  Plus,
  Save,
  Trash2,
  Upload
} from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"

import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridKeyboardShortcuts } from "@/components/data-grid/data-grid-keyboard-shortcuts"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
// Simulation flag is provided by server; no local UI switch needed
import { bulkCreateItems } from "@/server/actions/item/mutations"
import {
  parsePdfMenu,
  type PdfMenuItem
} from "@/server/actions/item/pdf-mutations"
import { useDataGrid } from "@/hooks/use-data-grid"
import { MenuItemStatus } from "@/lib/types"

type EditableItem = PdfMenuItem & { _id: string }

const MAX_PDF_FILE_SIZE_MB = 6
const MAX_PDF_FILE_SIZE_BYTES = MAX_PDF_FILE_SIZE_MB * 1024 * 1024

function generateId() {
  return Math.random().toString(36).slice(2)
}

export default function PdfImportForm({
  simulateEnabled = true
}: {
  simulateEnabled?: boolean
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<EditableItem[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const simulateResponse = simulateEnabled
  const [simulateScenario, setSimulateScenario] = useState<
    "default" | "variants"
  >("default")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  const { execute: executeParse, reset } = useAction(parsePdfMenu, {
    onSuccess: response => {
      if (response.data?.failure) {
        setParseError(response.data.failure.reason)
        setIsParsing(false)
        reset()
        return
      }
      const extracted = (response.data?.success ?? []).map(item => ({
        ...item,
        variantName: item.variantName ?? "Regular",
        _id: generateId()
      }))
      setItems(extracted)
      setIsParsing(false)
      reset()
    },
    onError: error => {
      console.error(error)
      Sentry.captureException(error, { tags: { section: "pdf-import" } })
      setParseError("Error al procesar el archivo PDF")
      setIsParsing(false)
    }
  })

  const {
    execute: executeBulkCreate,
    isPending: isSaving,
    reset: resetBulkCreate
  } = useAction(bulkCreateItems, {
    onSuccess: response => {
      if (response.data?.failure) {
        toast.error(response.data.failure.reason)
        resetBulkCreate()
        return
      }
      toast.success(
        `${response.data?.success?.length} productos importados correctamente`
      )
      // Clear UI state: items grid and selected file
      setItems([])
      setSelectedFile(null)
      setParseError(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      resetBulkCreate()
      router.push("/dashboard/menu-items")
    },
    onError: error => {
      console.error(error)
      Sentry.captureException(error, { tags: { section: "pdf-import-save" } })
      toast.error("Error al guardar los productos")
    }
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > MAX_PDF_FILE_SIZE_BYTES) {
      setSelectedFile(null)
      setItems([])
      setParseError(
        `El archivo es demasiado grande. El tamaño máximo permitido es ${MAX_PDF_FILE_SIZE_MB} MB.`
      )
      return
    }

    setSelectedFile(file)
    setParseError(null)
    setItems([])
  }

  const handleParse = useCallback(async () => {
    if (!selectedFile) return
    setIsParsing(true)
    setParseError(null)

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1]
      if (!base64) {
        setParseError("No se pudo leer el archivo")
        setIsParsing(false)
        return
      }
      executeParse({
        pdfBase64: base64,
        simulateResponse,
        simulateScenario
      })
    }
    reader.onerror = () => {
      setParseError("Error al leer el archivo")
      setIsParsing(false)
    }
    reader.readAsDataURL(selectedFile)
  }, [selectedFile, executeParse, simulateResponse, simulateScenario])

  const handleDeleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item._id !== id))
  }, [])

  const currencyOptions: CellSelectOption[] = useMemo(
    () => [
      { label: "MXN", value: "MXN" },
      { label: "USD", value: "USD" }
    ],
    []
  )

  const handleDataChange = useCallback((newData: EditableItem[]) => {
    setItems(
      newData.map(item => ({
        ...item,
        variantName: item.variantName ?? "Regular",
        description: item.description ?? "",
        category: item.category ?? "",
        currency: item.currency === "USD" ? "USD" : "MXN",
        price:
          typeof item.price === "number" && !Number.isNaN(item.price)
            ? item.price
            : 0
      }))
    )
  }, [])

  const handleRowsDelete = useCallback((rows: EditableItem[]) => {
    if (rows.length === 0) return

    const idsToDelete = new Set(rows.map(row => row._id))
    setItems(prev => prev.filter(item => !idsToDelete.has(item._id)))
  }, [])

  const columns: ColumnDef<EditableItem>[] = useMemo(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Nombre *",
        size: 220,
        minSize: 180,
        meta: {
          label: "Nombre",
          cell: { variant: "short-text" as const }
        }
      },
      {
        id: "variantName",
        accessorKey: "variantName",
        header: "Variante",
        size: 160,
        minSize: 130,
        meta: {
          label: "Variante",
          cell: { variant: "short-text" as const }
        }
      },
      {
        id: "description",
        accessorKey: "description",
        header: "Descripción",
        size: 300,
        minSize: 220,
        meta: {
          label: "Descripción",
          cell: { variant: "long-text" as const }
        }
      },
      {
        id: "price",
        accessorKey: "price",
        header: "Precio *",
        size: 140,
        minSize: 120,
        meta: {
          label: "Precio",
          cell: {
            variant: "number" as const,
            min: 0,
            step: 0.01
          }
        }
      },
      {
        id: "category",
        accessorKey: "category",
        header: "Categoría",
        size: 180,
        minSize: 140,
        meta: {
          label: "Categoría",
          cell: { variant: "short-text" as const }
        }
      },
      {
        id: "currency",
        accessorKey: "currency",
        header: "Moneda",
        size: 120,
        minSize: 100,
        meta: {
          label: "Moneda",
          cell: {
            variant: "select" as const,
            options: currencyOptions
          }
        }
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Acciones</span>,
        size: 64,
        minSize: 64,
        maxSize: 64,
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteItem(row.original._id)}
            disabled={isSaving}
            className="size-8"
            aria-label="Eliminar producto"
          >
            <Trash2 className="size-4" />
          </Button>
        )
      }
    ],
    [currencyOptions, handleDeleteItem, isSaving]
  )

  const { table, ...dataGridProps } = useDataGrid({
    data: items,
    columns,
    onDataChange: handleDataChange,
    onRowsDelete: handleRowsDelete,
    getRowId: row => row._id,
    enableSearch: true,
    readOnly: isSaving
  })

  const groupPreview = useMemo(() => {
    const groupedByName = new Map<string, number>()

    for (const item of items) {
      const normalizedName = item.name.trim()
      if (!normalizedName) continue

      const key = normalizedName.toLowerCase()
      groupedByName.set(key, (groupedByName.get(key) ?? 0) + 1)
    }

    const totalRows = Array.from(groupedByName.values()).reduce(
      (sum, count) => sum + count,
      0
    )
    const groupedItems = groupedByName.size
    const multiVariantItems = Array.from(groupedByName.values()).filter(
      count => count > 1
    ).length

    return {
      totalRows,
      groupedItems,
      multiVariantItems
    }
  }, [items])

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        _id: generateId(),
        name: "",
        variantName: "Regular",
        description: "",
        price: 0,
        category: "",
        currency: "MXN"
      }
    ])
  }

  const handleSave = () => {
    const validItems = items.filter(item => item.name.trim())
    if (validItems.length === 0) {
      toast.error("Agrega al menos un producto con nombre")
      return
    }
    executeBulkCreate(
      validItems.map(item => ({
        name: item.name,
        variantName: item.variantName || undefined,
        description: item.description || undefined,
        price: item.price,
        status: MenuItemStatus.ACTIVE,
        category: item.category || undefined,
        currency: item.currency ?? "MXN"
      }))
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* File Upload */}
      <div className="flex w-full flex-col gap-3">
        <div
          className="group border-border hover:border-primary
            hover:bg-primary/10 flex cursor-pointer flex-col items-center
            justify-center gap-3 rounded-lg border-2 border-dashed p-8
            transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileText
            className="text-muted-foreground group-hover:text-primary size-10
              transition-colors"
          />
          <div className="text-center">
            <p className="text-sm font-medium">
              {selectedFile ? selectedFile.name : "Selecciona un archivo PDF"}
            </p>
            <p className="text-muted-foreground text-xs">
              Haz clic para seleccionar un PDF de tu menú (máximo{" "}
              {MAX_PDF_FILE_SIZE_MB} MB)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {selectedFile && (
          <div className="flex flex-col gap-3">
            {simulateEnabled && simulateResponse && (
              <div className="flex items-center gap-3">
                <Label htmlFor="simulate-scenario" className="text-sm">
                  Escenario de simulación
                </Label>
                <select
                  id="simulate-scenario"
                  value={simulateScenario}
                  onChange={event =>
                    setSimulateScenario(
                      event.target.value as "default" | "variants"
                    )
                  }
                  className="border-input bg-background h-9 rounded-md border
                    px-3 text-sm"
                  disabled={isParsing || isSaving}
                >
                  <option value="default">Menú simple</option>
                  <option value="variants">
                    Múltiples variantes por producto
                  </option>
                </select>
              </div>
            )}

            <Button
              onClick={handleParse}
              disabled={isParsing || isSaving}
              className="self-start"
            >
              {isParsing ? (
                <Loader className="mr-2 size-4 animate-spin" />
              ) : (
                <Upload className="mr-2 size-4" />
              )}
              {isParsing
                ? "Extrayendo productos..."
                : simulateResponse
                  ? "Simular extracción"
                  : "Extraer productos del PDF"}
            </Button>
          </div>
        )}
      </div>

      {/* Parse Error */}
      {parseError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Error al procesar el PDF</AlertTitle>
          <AlertDescription>{parseError}</AlertDescription>
        </Alert>
      )}

      {/* Items Table */}
      {items.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">
                {items.length} producto{items.length !== 1 ? "s" : ""} extraído
                {items.length !== 1 ? "s" : ""}. Revisa y edita antes de
                guardar.
              </p>
              <p className="text-muted-foreground text-xs">
                Vista previa de guardado: {groupPreview.totalRows} fila
                {groupPreview.totalRows !== 1 ? "s" : ""} →{" "}
                {groupPreview.groupedItems} producto
                {groupPreview.groupedItems !== 1 ? "s" : ""} con{" "}
                {groupPreview.totalRows} variante
                {groupPreview.totalRows !== 1 ? "s" : ""}
                {groupPreview.multiVariantItems > 0
                  ? ` (${groupPreview.multiVariantItems} con múltiples variantes)`
                  : ""}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              disabled={isSaving}
            >
              <Plus className="mr-1 size-4" />
              Agregar producto
            </Button>
          </div>

          <div className="rounded-lg border">
            <DataGridKeyboardShortcuts enableSearch />
            <DataGrid
              table={table}
              {...dataGridProps}
              columns={columns}
              height={400}
              stretchColumns
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              {isSaving ? "Guardando..." : `Guardar ${items.length} productos`}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
