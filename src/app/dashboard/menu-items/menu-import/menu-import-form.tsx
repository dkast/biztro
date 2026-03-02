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
  SparklesIcon,
  Trash2
} from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { TextMorph } from "torph/react"

import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridKeyboardShortcuts } from "@/components/data-grid/data-grid-keyboard-shortcuts"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
// Simulation flag is provided by server; no local UI switch needed
import {
  bulkCreateItems,
  parseMenuFile,
  SUPPORTED_UPLOAD_MIME_TYPES,
  type MenuImportItem
} from "@/server/actions/item/mutations"
import { useDataGrid } from "@/hooks/use-data-grid"
import { MenuItemStatus } from "@/lib/types"

type EditableItem = MenuImportItem & { _id: string }

const MAX_PDF_FILE_SIZE_MB = 5
const MAX_PDF_FILE_SIZE_BYTES = MAX_PDF_FILE_SIZE_MB * 1024 * 1024

type SupportedUploadMimeType = (typeof SUPPORTED_UPLOAD_MIME_TYPES)[number]

const FILE_INPUT_ACCEPT =
  ".pdf,application/pdf,.png,image/png,.jpg,.jpeg,image/jpeg,.webp,image/webp"

function getSupportedMimeType(file: File): SupportedUploadMimeType | null {
  if (
    SUPPORTED_UPLOAD_MIME_TYPES.includes(file.type as SupportedUploadMimeType)
  ) {
    return file.type as SupportedUploadMimeType
  }

  const lowercaseName = file.name.toLowerCase()
  if (lowercaseName.endsWith(".pdf")) return "application/pdf"
  if (lowercaseName.endsWith(".png")) return "image/png"
  if (lowercaseName.endsWith(".jpg") || lowercaseName.endsWith(".jpeg")) {
    return "image/jpeg"
  }
  if (lowercaseName.endsWith(".webp")) return "image/webp"

  return null
}

function generateId() {
  return Math.random().toString(36).slice(2)
}

export default function MenuImportForm({
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
  const [selectedMimeType, setSelectedMimeType] =
    useState<SupportedUploadMimeType | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  const { execute: executeParse, reset } = useAction(parseMenuFile, {
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
      setSelectedMimeType(null)
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

    const mimeType = getSupportedMimeType(file)
    if (!mimeType) {
      setSelectedFile(null)
      setSelectedMimeType(null)
      setItems([])
      setParseError("Formato no soportado. Usa PDF, PNG, JPG/JPEG o WEBP.")
      return
    }

    if (file.size > MAX_PDF_FILE_SIZE_BYTES) {
      setSelectedFile(null)
      setSelectedMimeType(null)
      setItems([])
      setParseError(
        `El archivo es demasiado grande. El tamaño máximo permitido es ${MAX_PDF_FILE_SIZE_MB} MB.`
      )
      return
    }

    setSelectedFile(file)
    setSelectedMimeType(mimeType)
    setParseError(null)
    setItems([])
  }

  const handleParse = useCallback(() => {
    if (!selectedFile || !selectedMimeType) return
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
        fileBase64: base64,
        mimeType: selectedMimeType,
        simulateResponse,
        simulateScenario
      })
    }
    reader.onerror = () => {
      setParseError("Error al leer el archivo")
      setIsParsing(false)
    }
    reader.readAsDataURL(selectedFile)
  }, [
    selectedFile,
    selectedMimeType,
    executeParse,
    simulateResponse,
    simulateScenario
  ])

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

    setItems(prev => prev.filter(row => !rows.includes(row)))
  }, [])

  const handleRowAdd = useCallback(() => {
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

    return {
      rowIndex: items.length,
      columnId: "name"
    }
  }, [items.length])

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
    onRowAdd: handleRowAdd,
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

  const isMac =
    typeof navigator !== "undefined"
      ? /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
      : false

  const modKey = isMac ? "⌘" : "Ctrl"

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
          role="button"
          tabIndex={0}
          onKeyDown={event => {
            if (event.key === "Enter" || event.code === "Space") {
              event.preventDefault()
              fileInputRef.current?.click()
            }
          }}
        >
          <FileText
            className="text-muted-foreground group-hover:text-primary size-10
              transition-colors"
          />
          <div className="text-center">
            <p className="text-sm font-medium">
              {selectedFile
                ? selectedFile.name
                : "Selecciona un archivo (PDF o imagen)"}
            </p>
            <p className="text-muted-foreground text-xs">
              Haz clic para seleccionar un PDF o imagen de tu menú (máximo{" "}
              {MAX_PDF_FILE_SIZE_MB} MB)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={FILE_INPUT_ACCEPT}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {selectedFile && (
          <div className="flex flex-col items-center justify-center gap-3">
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
              className="bg-linear-to-r/oklch from-indigo-500 via-pink-500
                to-orange-500"
            >
              {isParsing ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <SparklesIcon className="size-4 fill-current" />
              )}
              {isParsing
                ? "Extrayendo productos..."
                : simulateResponse
                  ? "Simular extracción"
                  : "Extraer productos del archivo"}
            </Button>
          </div>
        )}
      </div>

      {/* Parse Error */}
      {parseError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Error al procesar el archivo</AlertTitle>
          <AlertDescription>{parseError}</AlertDescription>
        </Alert>
      )}

      {/* Items Table */}
      {items.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-end-safe gap-2 px-3">
            <p className="text-sm font-medium">
              {items.length} producto{items.length !== 1 ? "s" : ""} extraído
              {items.length !== 1 ? "s" : ""}. Revisa y edita antes de guardar.
            </p>
            <p className="text-muted-foreground text-xs">
              {groupPreview.totalRows} fila
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

          <div className="flex justify-between">
            <div className="px-2">
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
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader className="size-4 animate-spin" />}
              <TextMorph>
                {isSaving
                  ? "Guardando..."
                  : `Guardar ${items.length} productos`}
              </TextMorph>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
