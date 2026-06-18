"use client"

import { useCallback, useMemo, useRef, useState, type ChangeEvent } from "react"
import toast from "react-hot-toast"
import { type CellSelectOption } from "@/types/data-grid"
import * as Sentry from "@sentry/nextjs"
import type { ColumnDef } from "@tanstack/react-table"
import { BorderBeam } from "border-beam"
import {
  AlertCircle,
  Check,
  ChevronRight,
  CircleAlert,
  FileText,
  Loader,
  Lock,
  SparklesIcon,
  Trash2
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TextMorph } from "torph/react"

import { UpgradeDialog } from "@/components/dashboard/upgrade-dialog"
import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridKeyboardShortcuts } from "@/components/data-grid/data-grid-keyboard-shortcuts"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle
} from "@/components/ui/field"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
// Simulation flag is provided by server; no local UI switch needed
import {
  bulkCreateItems,
  parseMenuFile,
  type MenuImportItem
} from "@/server/actions/item/mutations"
import { createMenuFromImport } from "@/server/actions/menu-import/mutations"
import { useDataGrid } from "@/hooks/use-data-grid"
import { appConfig } from "@/app/config"
import { SUPPORTED_UPLOAD_MIME_TYPES } from "@/lib/types/media"
import { MenuItemStatus } from "@/lib/types/menu-item"
import { cn } from "@/lib/utils"

type EditableItem = MenuImportItem & { _id: string }
type ImportMode = "items" | "full-menu"
type StoredImportFile = {
  fileBase64: string
  mimeType: SupportedUploadMimeType
  simulateResponse: boolean
  simulateScenario: "default" | "variants"
}

function ProcessStep({
  number,
  label,
  active,
  done
}: {
  number: number
  label: string
  active?: boolean
  done?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          `flex size-6 shrink-0 items-center justify-center rounded-full text-xs
          font-medium`,
          done
            ? "text-secondary-foreground bg-secondary"
            : active
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
        )}
      >
        {done ? <Check className="size-3.5" /> : number}
      </span>
      <span
        className={cn(
          "text-sm",
          active ? "text-foreground font-medium" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  )
}

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

function getReliabilityBadgeVariant(item: MenuImportItem) {
  if (item.needsReview || item.reliabilityScore < 0.75) return "yellow"
  if (item.reliabilityScore >= 0.9) return "green"

  return "secondary"
}

function getReliabilityLabel(item: MenuImportItem) {
  if (item.needsReview) return "Revisar"

  return `${Math.round(item.reliabilityScore * 100)}%`
}

function toActionItems(items: EditableItem[]) {
  return items
    .filter(item => item.name.trim())
    .map(item => ({
      name: item.name,
      variantName: item.variantName || undefined,
      description: item.description || undefined,
      price: item.price,
      status: MenuItemStatus.ACTIVE,
      category: item.category || undefined,
      currency: item.currency ?? "MXN"
    }))
}

export default function MenuImportForm({
  simulateEnabled = true,
  isPro = false,
  returnTo
}: {
  simulateEnabled?: boolean
  isPro?: boolean
  returnTo?: string
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
  const [sourceFileInput, setSourceFileInput] =
    useState<StoredImportFile | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [importMode, setImportMode] = useState<ImportMode>("items")

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
      const createdItems = response.data?.success
      if (!createdItems?.length) {
        toast.error("No se pudieron guardar los productos importados")
        resetBulkCreate()
        return
      }

      toast.success(`${createdItems.length} productos importados correctamente`)
      // Clear UI state: items grid and selected file
      setItems([])
      setSelectedFile(null)
      setSelectedMimeType(null)
      setParseError(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      resetBulkCreate()
      router.push(returnTo ?? "/dashboard/menu-items")
    },
    onError: error => {
      console.error(error)
      Sentry.captureException(error, { tags: { section: "pdf-import-save" } })
      toast.error("Error al guardar los productos")
    }
  })
  const {
    execute: executeCreateMenuFromImport,
    isPending: isCreatingMenu,
    reset: resetCreateMenuFromImport
  } = useAction(createMenuFromImport, {
    onSuccess: response => {
      if (response.data?.failure) {
        toast.error(response.data.failure.reason)
        resetCreateMenuFromImport()
        return
      }

      const menuId = response.data?.success?.menu.id
      if (!menuId) {
        toast.error("No se pudo abrir el menú generado")
        resetCreateMenuFromImport()
        return
      }

      toast.success("Menú completo generado correctamente")
      setItems([])
      setSelectedFile(null)
      setSelectedMimeType(null)
      setSourceFileInput(null)
      setParseError(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      resetCreateMenuFromImport()
      router.push(`/menu-editor/${menuId}`)
    },
    onError: error => {
      console.error(error)
      Sentry.captureException(error, {
        tags: { section: "menu-import-full-menu" }
      })
      toast.error("Error al generar el menú completo")
    }
  })

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const mimeType = getSupportedMimeType(file)
    if (!mimeType) {
      setSelectedFile(null)
      setSelectedMimeType(null)
      setSourceFileInput(null)
      setItems([])
      setParseError("Formato no soportado. Usa PDF, PNG, JPG/JPEG o WEBP.")
      return
    }

    if (file.size > MAX_PDF_FILE_SIZE_BYTES) {
      setSelectedFile(null)
      setSelectedMimeType(null)
      setSourceFileInput(null)
      setItems([])
      setParseError(
        `El archivo es demasiado grande. El tamaño máximo permitido es ${MAX_PDF_FILE_SIZE_MB} MB.`
      )
      return
    }

    setSelectedFile(file)
    setSelectedMimeType(mimeType)
    setSourceFileInput(null)
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
      setSourceFileInput({
        fileBase64: base64,
        mimeType: selectedMimeType,
        simulateResponse,
        simulateScenario
      })
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

  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)

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
        currency: "MXN",
        reliabilityScore: 1,
        needsReview: false,
        reviewReasons: [],
        corrections: []
      }
    ])

    return {
      rowIndex: items.length,
      columnId: "name"
    }
  }, [items.length])

  const isMutating = isSaving || isCreatingMenu

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
        id: "reliability",
        accessorKey: "reliabilityScore",
        header: () => "Revisión IA",
        size: 180,
        minSize: 160,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const item = row.original
          const score = Math.round(item.reliabilityScore * 100)
          const reviewReasons = item.reviewReasons.length
            ? item.reviewReasons
            : ["Extracción con confianza media"]

          return (
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant={getReliabilityBadgeVariant(item)}
                    className="cursor-help"
                  >
                    {getReliabilityLabel(item)}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-72">
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">
                      Confiabilidad estimada: {score}%
                    </p>
                    {item.needsReview || item.reliabilityScore < 0.75 ? (
                      <ul className="list-disc pl-4">
                        {reviewReasons.map(reason => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>La IA no detectó señales claras de ambigüedad.</p>
                    )}
                    {item.corrections.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        <p className="font-medium">Correcciones OCR</p>
                        {item.corrections.map(correction => (
                          <p key={`${correction.field}-${correction.original}`}>
                            {correction.original} → {correction.corrected}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </TooltipContent>
              </Tooltip>
              {item.corrections.length > 0 ? (
                <Badge variant="blue">Corregido</Badge>
              ) : null}
            </div>
          )
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
            disabled={isMutating}
            className="size-8"
            aria-label="Eliminar producto"
          >
            <Trash2 className="size-4" />
          </Button>
        )
      }
    ],
    [currencyOptions, handleDeleteItem, isMutating]
  )

  const { table, ...dataGridProps } = useDataGrid({
    data: items,
    columns,
    onDataChange: handleDataChange,
    onRowAdd: handleRowAdd,
    onRowsDelete: handleRowsDelete,
    getRowId: row => row._id,
    enableSearch: true,
    readOnly: isMutating
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
  const reviewSummary = useMemo(() => {
    const needsReview = items.filter(
      item => item.needsReview || item.reliabilityScore < 0.75
    )
    const correctedRows = items.filter(item => item.corrections.length > 0)

    return {
      needsReviewCount: needsReview.length,
      correctedRowsCount: correctedRows.length
    }
  }, [items])

  const handleImportModeChange = (value: string) => {
    if (!value) return

    if (value === "full-menu" && !isPro) {
      setShowUpgradeDialog(true)
      return
    }

    setImportMode(value as ImportMode)
  }

  const handleSave = () => {
    const validItems = toActionItems(items)
    if (validItems.length === 0) {
      toast.error("Agrega al menos un producto con nombre")
      return
    }

    if (!isPro && groupPreview.groupedItems > appConfig.itemLimit) {
      setShowUpgradeDialog(true)
      return
    }

    executeBulkCreate(validItems)
  }

  const handleCreateFullMenu = () => {
    const validItems = toActionItems(items)
    if (validItems.length === 0) {
      toast.error("Agrega al menos un producto con nombre")
      return
    }

    if (!isPro) {
      setShowUpgradeDialog(true)
      return
    }

    if (!sourceFileInput) {
      toast.error("Vuelve a procesar el archivo antes de generar el menú")
      return
    }

    const menuName = selectedFile?.name.replace(/\.[^.]+$/, "")

    executeCreateMenuFromImport({
      ...sourceFileInput,
      menuName,
      items: validItems
    })
  }

  const isMac =
    typeof navigator !== "undefined"
      ? /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
      : false

  const modKey = isMac ? "⌘" : "Ctrl"
  const step = items.length > 0 ? 3 : selectedFile ? 2 : 1

  const isFullMenuMode = importMode === "full-menu"
  const hasImportedItems = items.length > 0
  const stepLabels: [string, string, string] = isFullMenuMode
    ? ["Sube tu archivo", "La IA extrae y diseña", "Genera y abre el editor"]
    : ["Sube tu archivo", "La IA extrae los productos", "Revisa y guarda"]

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        {/* Process steps */}
        <div
          className="border-border bg-muted/40 flex flex-wrap items-center
            gap-x-3 gap-y-2 rounded-lg border px-4 py-3"
        >
          <ProcessStep
            number={1}
            label={stepLabels[0]}
            active={step === 1}
            done={step > 1}
          />
          <ChevronRight className="text-muted-foreground size-4 shrink-0" />
          <ProcessStep
            number={2}
            label={stepLabels[1]}
            active={step === 2}
            done={step > 2}
          />
          <ChevronRight className="text-muted-foreground size-4 shrink-0" />
          <ProcessStep number={3} label={stepLabels[2]} active={step === 3} />
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-medium">Modo de importación</p>
          </div>
          <RadioGroup
            value={importMode}
            onValueChange={handleImportModeChange}
            className="grid gap-2 sm:grid-cols-2"
          >
            <FieldLabel htmlFor="import-mode-items" className="h-full">
              <Field orientation="horizontal" className="h-full items-start">
                <FieldContent>
                  <FieldTitle>Solo productos</FieldTitle>
                  <FieldDescription>
                    Extrae productos para revisarlos y guardarlos en tu
                    catálogo.
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem id="import-mode-items" value="items" />
              </Field>
            </FieldLabel>
            <FieldLabel htmlFor="import-mode-full-menu" className="h-full">
              <Field orientation="horizontal" className="h-full items-start">
                <FieldContent>
                  <FieldTitle className="flex items-center gap-1.5">
                    {!isPro && <Lock className="size-3.5" />}
                    Menú completo Pro
                  </FieldTitle>
                  <FieldDescription>
                    Genera un menú digital completo con diseño y abre el editor.
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem id="import-mode-full-menu" value="full-menu" />
              </Field>
            </FieldLabel>
          </RadioGroup>
          <p className="text-muted-foreground text-xs">
            {isFullMenuMode
              ? "Generamos un menú digital con estilo a partir de tu archivo y abrimos el editor para que lo publiques."
              : "Los productos se agregan a tu catálogo para editarlos y usarlos en cualquier menú."}
          </p>
        </div>

        {/* File Upload */}
        <div className="flex w-full flex-col gap-3">
          <AnimatePresence initial={false} mode="wait">
            {hasImportedItems && selectedFile ? (
              <motion.div
                key="file-compact"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-muted/50 border-border inline-flex max-w-full
                  items-center gap-2 rounded-md border px-3 py-2"
              >
                <FileText className="text-muted-foreground size-4 shrink-0" />
                <p className="truncate text-sm font-medium">
                  {selectedFile.name}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="file-expanded"
                initial={{ opacity: 0, y: 8, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.99 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div
                  className="group border-border hover:border-primary
                    hover:bg-primary/10 flex cursor-pointer flex-col
                    items-center justify-center gap-3 rounded-lg border-2
                    border-dashed p-8 transition-colors"
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
                    className="text-muted-foreground group-hover:text-primary
                      size-10 transition-colors"
                  />
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {selectedFile
                        ? selectedFile.name
                        : "Haz clic para seleccionar un archivo"}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Funciona mejor con menús en texto claro y bien iluminados.
                    </p>
                    <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                      {["PDF", "PNG", "JPG", "WEBP"].map(fmt => (
                        <span
                          key={fmt}
                          className="bg-muted text-muted-foreground inline-flex
                            items-center rounded-md px-2 py-0.5 text-xs
                            font-medium"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                    <p className="text-muted-foreground mt-1.5 text-xs">
                      Tamaño máximo {MAX_PDF_FILE_SIZE_MB} MB
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
              </motion.div>
            )}
          </AnimatePresence>

          {!isPro && items.length === 0 && (
            <p className="text-muted-foreground text-center text-xs">
              El plan básico incluye hasta {appConfig.itemLimit} productos.{" "}
              <Link
                href="/dashboard/settings/billing"
                prefetch={false}
                className="text-primary underline-offset-4 hover:underline"
              >
                Actualiza a Pro
              </Link>{" "}
              para importar sin límite.
            </p>
          )}

          {selectedFile && !hasImportedItems && (
            <div
              className="mt-6 flex flex-col items-center justify-center gap-3"
            >
              {simulateEnabled && simulateResponse && (
                <div className="flex items-center gap-3">
                  <Label htmlFor="simulate-scenario" className="text-sm">
                    Escenario de simulación
                  </Label>
                  <Select
                    value={simulateScenario}
                    onValueChange={value =>
                      setSimulateScenario(value as "default" | "variants")
                    }
                    disabled={isParsing || isSaving}
                  >
                    <SelectTrigger id="simulate-scenario" className="w-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Menú simple</SelectItem>
                      <SelectItem value="variants">
                        Múltiples variantes por producto
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <BorderBeam active={isParsing}>
                <Button
                  onClick={handleParse}
                  disabled={isParsing || isMutating}
                  variant={items.length > 0 ? "outline" : "default"}
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
              </BorderBeam>
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

        {/* Extraction Skeleton */}
        {isParsing && items.length === 0 && (
          <div className="mt-10 flex flex-col gap-5" aria-hidden="true">
            <Skeleton className="h-5 w-72" />
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-full" />
              ))}
            </div>
          </div>
        )}

        {/* Items Table */}
        {items.length > 0 && (
          <div className="mt-10 flex flex-col gap-5">
            {!isPro && groupPreview.groupedItems > appConfig.itemLimit && (
              <Alert variant="warning">
                <CircleAlert className="size-4" />
                <AlertTitle>Superaste el límite del plan básico</AlertTitle>
                <AlertDescription className="flex flex-col gap-3">
                  <span>
                    Tienes {groupPreview.groupedItems} productos para importar,
                    pero el plan básico permite hasta {appConfig.itemLimit}.
                    Actualiza a Pro para guardarlos todos.
                  </span>
                  <Button asChild size="sm" className="self-start">
                    <Link href="/dashboard/settings/billing" prefetch={false}>
                      Actualizar a Pro
                    </Link>
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <div className="flex flex-row items-end-safe gap-2 px-3">
              <p className="text-sm font-medium">
                {items.length} producto{items.length !== 1 ? "s" : ""} extraído
                {items.length !== 1 ? "s" : ""}. Revisa y edita antes de
                guardar.
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

            {reviewSummary.needsReviewCount > 0 ||
            reviewSummary.correctedRowsCount > 0 ? (
              <Alert variant="information">
                <CircleAlert className="size-4" />
                <AlertTitle>Revisión recomendada</AlertTitle>
                <AlertDescription>
                  {reviewSummary.needsReviewCount} fila
                  {reviewSummary.needsReviewCount === 1 ? "" : "s"} se sugiere
                  revisión. {reviewSummary.correctedRowsCount} fila
                  {reviewSummary.correctedRowsCount === 1 ? "" : "s"} incluye
                  {reviewSummary.correctedRowsCount === 1 ? "" : "n"}{" "}
                  correcciones sugeridas por la IA.
                </AlertDescription>
              </Alert>
            ) : null}

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
              <Button
                onClick={
                  importMode === "full-menu" ? handleCreateFullMenu : handleSave
                }
                disabled={isMutating}
              >
                {isMutating && <Loader className="size-4 animate-spin" />}
                <TextMorph>
                  {isCreatingMenu
                    ? "Generando menú completo..."
                    : isSaving
                      ? "Guardando..."
                      : importMode === "full-menu"
                        ? "Crear menú completo"
                        : `Guardar ${items.length} productos`}
                </TextMorph>
              </Button>
            </div>
            {isFullMenuMode && (
              <p className="text-muted-foreground px-2 text-right text-xs">
                Al generar, abriremos el editor del menú para que ajustes el
                diseño y lo publiques.
              </p>
            )}
          </div>
        )}
        <UpgradeDialog
          open={showUpgradeDialog}
          onClose={() => setShowUpgradeDialog(false)}
          title="Actualizar a Pro"
          description="Actualiza tu plan a Pro para importar productos sin límite o crear un menú completo con IA ✨"
        />
      </div>
    </TooltipProvider>
  )
}
