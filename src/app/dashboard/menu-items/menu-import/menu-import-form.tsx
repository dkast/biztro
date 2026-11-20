"use client"

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent
} from "react"
import toast from "react-hot-toast"
import { type CellSelectOption } from "@/types/data-grid"
import * as Sentry from "@sentry/nextjs"
import { GlimmScope, type GlimmScopeHandle } from "glimm/next"
import { Ring } from "loading-dev"
import {
  AlertCircle,
  CircleAlert,
  FileText,
  Lock,
  SparklesIcon,
  Trash2,
  Upload
} from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Tooltip as TooltipPrimitive } from "radix-ui"
import { TextMorph } from "torph/react"

import { UpgradeDialog } from "@/components/dashboard/upgrade-dialog"
import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridKeyboardShortcuts } from "@/components/data-grid/data-grid-keyboard-shortcuts"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import {
  bulkCreateItems,
  parseMenuFile,
  type MenuImportItem
} from "@/server/actions/item/mutations"
import { createMenuFromImport } from "@/server/actions/menu-import/mutations"
import { useDataGrid } from "@/hooks/use-data-grid"
import { appConfig } from "@/app/config"
import type { ColumnDef } from "@/lib/data-grid-table"
import { SUPPORTED_UPLOAD_MIME_TYPES } from "@/lib/types/media"
import { MenuItemStatus } from "@/lib/types/menu-item"
import { cn } from "@/lib/utils"

type EditableItem = MenuImportItem & { _id: string }
type SimulateScenario = "default" | "variants"

const MAX_PDF_FILE_SIZE_MB = 5
const MAX_PDF_FILE_SIZE_BYTES = MAX_PDF_FILE_SIZE_MB * 1024 * 1024

// GlimmScope clips to its box and needs a fixed size; the grid fills it.
const STAGE_HEIGHT = 480

// The import card fades out this long before the glimm warp starts.
const CARD_EXIT_MS = 180

const PARSE_ERROR_MESSAGE =
  "No pudimos procesar el archivo. Inténtalo de nuevo en unos segundos."

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

function getFileValidationError(file: File) {
  if (!getSupportedMimeType(file)) {
    return "Formato no soportado. Usa PDF, PNG, JPG/JPEG o WEBP."
  }

  if (file.size > MAX_PDF_FILE_SIZE_BYTES) {
    return `El archivo es demasiado grande. El tamaño máximo permitido es ${MAX_PDF_FILE_SIZE_MB} MB.`
  }

  return null
}

function readFileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1]
      if (base64) resolve(base64)
      else reject(new Error("No se pudo leer el archivo"))
    }
    reader.onerror = () => reject(new Error("Error al leer el archivo"))
    reader.readAsDataURL(file)
  })
}

function generateId() {
  return Math.random().toString(36).slice(2)
}

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`
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
  const scopeRef = useRef<GlimmScopeHandle>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sourceFileBase64Ref = useRef<string | null>(null)
  const [items, setItems] = useState<EditableItem[]>([])
  const [isParsing, setIsParsing] = useState(false)
  // True from the file pick until the reveal sweep has left the grid; the
  // action bar waits for it so it arrives after the data.
  const [isRevealing, setIsRevealing] = useState(false)
  // glimm's page effect keeps the stage inside a WebGL canvas, and a resize
  // while idle leaves its texture incomplete (renders black). Turn it on only
  // for the reveal sweep; the card exit delay gives the canvas time to mount.
  const [isSweeping, setIsSweeping] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [simulateScenario, setSimulateScenario] =
    useState<SimulateScenario>("default")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedMimeType, setSelectedMimeType] =
    useState<SupportedUploadMimeType | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)

  const { executeAsync: parseFileAsync, reset: resetParse } =
    useAction(parseMenuFile)

  const clearImport = () => {
    setItems([])
    setSelectedFile(null)
    setSelectedMimeType(null)
    sourceFileBase64Ref.current = null
    setParseError(null)
  }

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
      clearImport()
      resetBulkCreate()
      router.push(returnTo ?? "/dashboard/menu-items")
    },
    onError: error => {
      console.error(error)
      Sentry.captureException(error, { tags: { section: "pdf-import-save" } })
      toast.error("Error al guardar los productos")
      resetBulkCreate()
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
      clearImport()
      resetCreateMenuFromImport()
      router.push(`/menu-editor/${menuId}`)
    },
    onError: error => {
      console.error(error)
      Sentry.captureException(error, {
        tags: { section: "menu-import-full-menu" }
      })
      toast.error("Error al generar el menú completo")
      resetCreateMenuFromImport()
    }
  })

  const isMutating = isSaving || isCreatingMenu
  const hasItems = items.length > 0

  const extractItems = async (
    file: File,
    mimeType: SupportedUploadMimeType
  ): Promise<EditableItem[]> => {
    const fileBase64 = await readFileAsBase64(file)
    sourceFileBase64Ref.current = fileBase64

    let result: Awaited<ReturnType<typeof parseFileAsync>>
    try {
      result = await parseFileAsync({
        fileBase64,
        mimeType,
        simulateResponse: simulateEnabled,
        simulateScenario
      })
    } catch (error) {
      console.error(error)
      Sentry.captureException(error, { tags: { section: "pdf-import" } })
      throw new Error(PARSE_ERROR_MESSAGE)
    } finally {
      resetParse()
    }

    if (result?.serverError || result?.validationErrors) {
      Sentry.captureException(
        new Error(String(result.serverError ?? "Invalid import input")),
        { tags: { section: "pdf-import" } }
      )
      throw new Error(PARSE_ERROR_MESSAGE)
    }

    if (result?.data?.failure) throw new Error(result.data.failure.reason)

    const extracted = (result?.data?.success ?? []).map(item => ({
      ...item,
      variantName: item.variantName ?? "Regular",
      _id: generateId()
    }))

    if (extracted.length === 0) {
      throw new Error(
        "No encontramos productos en el archivo. Prueba con una imagen más nítida o un PDF con texto seleccionable."
      )
    }

    return extracted
  }

  const startImport = (file: File) => {
    const validationError = getFileValidationError(file)
    const mimeType = getSupportedMimeType(file)
    if (validationError || !mimeType) {
      clearImport()
      setParseError(validationError)
      return
    }

    setItems([])
    setSelectedFile(file)
    setSelectedMimeType(mimeType)
    sourceFileBase64Ref.current = null
    setParseError(null)
    setIsParsing(true)
    setIsRevealing(true)

    const work = () => extractItems(file, mimeType)
    const change = (extracted: EditableItem[]) => {
      setItems(extracted)
      setIsParsing(false)
    }
    const onFail = (error: unknown) => {
      setParseError(
        error instanceof Error ? error.message : PARSE_ERROR_MESSAGE
      )
      setIsParsing(false)
    }
    const onLeave = () => {
      setIsRevealing(false)
      setIsSweeping(false)
    }

    const scope = scopeRef.current
    if (!scope) {
      work().then(change, onFail).finally(onLeave)
      return
    }

    setIsSweeping(true)

    // Let the card finish leaving first: the warp starts as soon as play()
    // runs and would otherwise distort it too.
    window.setTimeout(() => {
      const liveScope = scopeRef.current
      if (!liveScope) return
      liveScope.play({ work, change, onFail, onLeave })
    }, CARD_EXIT_MS)
  }

  const openFilePicker = () => fileInputRef.current?.click()

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // Allow picking the same file again after an error.
    event.target.value = ""
    if (file) startImport(file)
  }

  const canDropFile = !hasItems && !isParsing && !isMutating

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = canDropFile ? "copy" : "none"
    if (!canDropFile) return
    setIsDragging(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return
    }
    setIsDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!canDropFile) return
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) startImport(file)
  }

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
                {/* Portaled so the grid's sticky header can't paint over it. */}
                <TooltipPrimitive.Portal>
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
                            <p
                              key={`${correction.field}-${correction.original}`}
                            >
                              {correction.original} → {correction.corrected}
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </TooltipContent>
                </TooltipPrimitive.Portal>
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

    return {
      totalRows,
      groupedItems: groupedByName.size
    }
  }, [items])

  const reviewSummary = useMemo(
    () => ({
      needsReviewCount: items.filter(
        item => item.needsReview || item.reliabilityScore < 0.75
      ).length,
      correctedRowsCount: items.filter(item => item.corrections.length > 0)
        .length
    }),
    [items]
  )

  const isOverPlanLimit =
    !isPro && groupPreview.groupedItems > appConfig.itemLimit

  const handleSave = () => {
    const validItems = toActionItems(items)
    if (validItems.length === 0) {
      toast.error("Agrega al menos un producto con nombre")
      return
    }

    if (isOverPlanLimit) {
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

    if (!sourceFileBase64Ref.current || !selectedMimeType) {
      toast.error("Vuelve a procesar el archivo antes de generar el menú")
      return
    }

    const menuName = selectedFile?.name.replace(/\.[^.]+$/, "")

    executeCreateMenuFromImport({
      fileBase64: sourceFileBase64Ref.current,
      mimeType: selectedMimeType,
      simulateResponse: simulateEnabled,
      simulateScenario,
      menuName,
      items: validItems
    })
  }

  const isMac =
    typeof navigator !== "undefined"
      ? /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
      : false
  const modKey = isMac ? "⌘" : "Ctrl"

  const productSummary =
    groupPreview.totalRows > groupPreview.groupedItems
      ? `${plural(groupPreview.groupedItems, "producto", "productos")} con ${groupPreview.totalRows} variantes`
      : plural(groupPreview.groupedItems, "producto", "productos")

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={FILE_INPUT_ACCEPT}
          onChange={handleFileChange}
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />

        <div
          className="relative w-full"
          style={{ height: STAGE_HEIGHT }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <GlimmScope
            ref={scopeRef}
            direction="ttb"
            curve={0.12}
            sweepMs={1600}
            // Only during the sweep: the editable grid must stay live DOM, not
            // a canvas, and an idle resize would render the canvas black.
            pageEffect={isSweeping}
            style={{ position: "absolute", inset: 0 }}
          >
            {/* Opaque base: the sweep freezes this subtree and layers it over
                the new content, so it must hide what is underneath. */}
            <div className="bg-background relative h-full">
              {hasItems ? (
                // The frame keeps the full stage height so the action bar sits
                // where the placeholder table ended; the grid's own border
                // would double up inside it.
                <div
                  className="h-full overflow-hidden rounded-md border
                    **:data-[slot=grid]:rounded-none
                    **:data-[slot=grid]:border-0"
                >
                  <DataGridKeyboardShortcuts enableSearch />
                  <DataGrid
                    table={table}
                    {...dataGridProps}
                    columns={columns}
                    height={STAGE_HEIGHT - 2}
                    stretchColumns
                  />
                </div>
              ) : (
                <>
                  <ImportGridSkeleton isPulsing={isParsing} />
                  <div
                    className="absolute inset-0 flex items-center justify-center
                      p-4"
                  >
                    <ImportCard
                      isPro={isPro}
                      isParsing={isParsing}
                      isDragging={isDragging}
                      parseError={parseError}
                      onPickFile={openFilePicker}
                      simulateEnabled={simulateEnabled}
                      simulateScenario={simulateScenario}
                      onSimulateScenarioChange={setSimulateScenario}
                    />
                  </div>
                </>
              )}
            </div>
          </GlimmScope>
        </div>

        {isParsing && (
          // Outside the GlimmScope so the warp doesn't distort it.
          <div
            role="status"
            aria-live="polite"
            className="animate-in fade-in flex items-center gap-3 duration-200
              motion-reduce:animate-none"
          >
            <Ring
              className="text-primary shrink-0 motion-reduce:animate-none"
              size={20}
            />
            <div className="flex min-w-0 flex-col">
              <p className="text-sm font-medium">Extrayendo productos...</p>
              <p className="text-muted-foreground truncate text-xs">
                {selectedFile?.name}
                {" · "}La IA está leyendo tu menú. Esto puede tardar unos
                segundos.
              </p>
            </div>
          </div>
        )}

        {hasItems && !isRevealing && (
          <div
            className="animate-in fade-in slide-in-from-bottom-1 flex flex-col
              gap-3 duration-300 motion-reduce:animate-none"
          >
            {isOverPlanLimit && (
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

            <div
              className="flex flex-col gap-4 sm:flex-row sm:items-center
                sm:justify-between"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{productSummary}</p>
                  {reviewSummary.needsReviewCount > 0 && (
                    <Badge variant="yellow">
                      {reviewSummary.needsReviewCount} por revisar
                    </Badge>
                  )}
                  {reviewSummary.correctedRowsCount > 0 && (
                    <Badge variant="blue">
                      {plural(
                        reviewSummary.correctedRowsCount,
                        "corregido",
                        "corregidos"
                      )}
                    </Badge>
                  )}
                </div>
                <div
                  className="text-muted-foreground flex min-w-0 items-center
                    gap-1.5 text-xs"
                >
                  <FileText className="size-3.5 shrink-0" />
                  <span className="truncate">{selectedFile?.name}</span>
                  <Button
                    variant="link"
                    onClick={openFilePicker}
                    disabled={isMutating}
                    className="h-auto shrink-0 p-0 text-xs"
                  >
                    Cambiar archivo
                  </Button>
                  <span className="hidden shrink-0 items-center gap-1 sm:flex">
                    <span aria-hidden="true">·</span>
                    <KbdGroup>
                      <Kbd>{modKey}</Kbd>
                      <Kbd>/</Kbd>
                    </KbdGroup>
                    atajos
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={handleCreateFullMenu}
                      disabled={isMutating}
                    >
                      {isCreatingMenu ? (
                        <Ring size={16} />
                      ) : isPro ? (
                        <SparklesIcon className="size-4" />
                      ) : (
                        <Lock className="size-4" />
                      )}
                      <TextMorph>
                        {isCreatingMenu
                          ? "Generando menú..."
                          : "Crear menú con diseño"}
                      </TextMorph>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-64">
                    {isPro
                      ? "Genera un menú digital con diseño a partir de tu archivo y abre el editor para publicarlo."
                      : "Función Pro. Genera un menú digital con diseño a partir de tu archivo y abre el editor."}
                  </TooltipContent>
                </Tooltip>
                <Button onClick={handleSave} disabled={isMutating}>
                  {isSaving && <Ring size={16} />}
                  <TextMorph>
                    {isSaving
                      ? "Guardando..."
                      : `Guardar ${plural(items.length, "producto", "productos")}`}
                  </TextMorph>
                </Button>
              </div>
            </div>
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

function ImportCard({
  isPro,
  isParsing,
  isDragging,
  parseError,
  onPickFile,
  simulateEnabled,
  simulateScenario,
  onSimulateScenarioChange
}: {
  isPro: boolean
  isParsing: boolean
  isDragging: boolean
  parseError: string | null
  onPickFile: () => void
  simulateEnabled: boolean
  simulateScenario: SimulateScenario
  onSimulateScenarioChange: (value: SimulateScenario) => void
}) {
  return (
    // The card leaves before the glimm warp starts, so the warp only ever
    // distorts the placeholder grid. Fade + slight scale, ease-out.
    <div
      inert={isParsing}
      aria-hidden={isParsing}
      style={{
        transitionProperty:
          "opacity, transform, color, background-color, border-color",
        transitionDuration: `${CARD_EXIT_MS}ms`,
        transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)"
      }}
      className={cn(
        `bg-card dark:smooth-shadow-lg smooth-shadow-ring-lg flex w-full
        max-w-md flex-col items-center gap-5 rounded-xl p-6 text-center
        dark:border`,
        isDragging && "border-primary bg-primary/5",
        isParsing && "scale-95 opacity-0 motion-reduce:scale-100"
      )}
    >
      <span
        className={cn(
          `bg-muted text-muted-foreground flex size-11 items-center
          justify-center rounded-lg transition-colors`,
          isDragging && "bg-primary/10 text-primary"
        )}
      >
        <FileText className="size-5" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-balance">
          {isDragging
            ? "Suelta el archivo para importarlo"
            : "Importa los productos de tu menú"}
        </h2>
        <p className="text-muted-foreground text-sm text-pretty">
          <span className="hidden sm:block">
            Arrastra un archivo aquí o selecciónalo.
          </span>
          <span className="block">
            PDF, PNG, JPG o WEBP de hasta {MAX_PDF_FILE_SIZE_MB} MB.
          </span>
        </p>
      </div>

      {parseError && (
        <Alert variant="destructive" className="text-left">
          <AlertCircle className="size-4" />
          <AlertTitle>Error al procesar el archivo</AlertTitle>
          <AlertDescription>{parseError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col items-center gap-2">
        <Button onClick={onPickFile}>
          <Upload className="size-4" />
          {parseError ? "Elegir otro archivo" : "Seleccionar archivo"}
        </Button>
        <p className="text-muted-foreground text-xs text-pretty">
          Funciona mejor con menús en texto claro y bien iluminados.
        </p>
      </div>

      {simulateEnabled && (
        <div className="flex items-center gap-2">
          <Label htmlFor="simulate-scenario" className="text-xs">
            Simulación
          </Label>
          <Select
            value={simulateScenario}
            onValueChange={value =>
              onSimulateScenarioChange(value as SimulateScenario)
            }
          >
            <SelectTrigger id="simulate-scenario" size="sm" className="w-auto">
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

      {!isPro && (
        <p
          className="text-muted-foreground w-full border-t pt-4 text-xs
            text-pretty"
        >
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
    </div>
  )
}

const SKELETON_COLUMNS = [
  { label: "Nombre", size: 220 },
  { label: "Variante", size: 160 },
  { label: "Descripción", size: 300 },
  { label: "Precio", size: 140 },
  { label: "Categoría", size: 180 },
  { label: "Moneda", size: 120 },
  { label: "Revisión IA", size: 180 }
]

const SKELETON_ROW_COUNT = 13

// Deterministic bar widths so the placeholder reads like real, uneven content.
const SKELETON_BAR_WIDTHS = ["w-3/4", "w-1/2", "w-2/3", "w-2/5", "w-3/5"]

// Mirrors the DataGrid frame (36px rows, hairline cells) so the reveal swaps
// placeholder rows for real ones in place.
function ImportGridSkeleton({ isPulsing }: { isPulsing: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="h-full overflow-hidden rounded-md border select-none"
    >
      <div className="flex h-9 border-b">
        {SKELETON_COLUMNS.map(column => (
          <div
            key={column.label}
            className="text-muted-foreground flex min-w-0 items-center border-e
              px-3 text-sm last:border-e-0"
            style={{ flex: `${column.size} 1 0` }}
          >
            <span className="truncate">{column.label}</span>
          </div>
        ))}
      </div>
      {Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex h-9 border-b">
          {SKELETON_COLUMNS.map((column, columnIndex) => (
            <div
              key={column.label}
              className="flex min-w-0 items-center border-e px-3
                last:border-e-0"
              style={{ flex: `${column.size} 1 0` }}
            >
              <div
                className={cn(
                  "bg-muted h-2.5 rounded-sm",
                  SKELETON_BAR_WIDTHS[
                    (rowIndex + columnIndex * 2) % SKELETON_BAR_WIDTHS.length
                  ],
                  isPulsing && "animate-pulse motion-reduce:animate-none"
                )}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
