"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
import {
  AlertCircle,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Loader,
  Upload
} from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import Papa from "papaparse"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  bulkCreateItems,
  exportMenuItems
} from "@/server/actions/item/mutations"
import { useIsMobile } from "@/hooks/use-mobile"
import { MenuItemStatus, type BulkMenuItem } from "@/lib/types/menu-item"

type CSVRow = {
  nombre: string
  variante?: string
  descripcion?: string
  precio: string
  categoria?: string
  moneda?: string
}

type ImportError = {
  row: number
  errors: string[]
}

const downloadCsvFile = (rows: CSVRow[], fileName: string) => {
  const csv = Papa.unparse(rows)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", fileName)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function ItemImport() {
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState<ImportError[]>([])
  const isMobile = useIsMobile()
  const { execute, isPending, reset } = useAction(bulkCreateItems, {
    onSuccess: response => {
      console.dir(response.data)
      if (response.data?.failure) {
        toast.error(response.data.failure.reason)
        return
      }
      toast.success(
        `${response.data?.success?.length} productos importados correctamente`
      )
      setOpen(false)
      reset()
    },
    onError: error => {
      console.error(error)
      Sentry.captureException(error, {
        tags: { section: "item-import" }
      })
      toast.error("Error al importar los productos")
      reset()
    }
  })

  const handleDialogOpenChange = (value: boolean) => {
    if (value || !isPending) {
      setOpen(value)
    }
  }

  const {
    execute: exportItems,
    isPending: isExporting,
    reset: resetExport
  } = useAction(exportMenuItems, {
    onSuccess: response => {
      const items = response.data?.success ?? []
      if (items.length === 0) {
        toast.error("No hay productos para exportar")
        resetExport()
        return
      }

      const csvRows: CSVRow[] = items.flatMap(item => {
        const variants = item.variants?.length
          ? item.variants
          : [{ name: "Regular", price: 0 }]

        return variants.map(variant => {
          const validPrice =
            typeof variant.price === "number" && !isNaN(variant.price)
              ? variant.price
              : 0

          return {
            nombre: item.name,
            variante: variant.name,
            descripcion: item.description ?? "",
            precio: validPrice.toFixed(2),
            categoria: item.category?.name,
            moneda: item.currency ?? "MXN"
          }
        })
      })

      downloadCsvFile(csvRows, "productos-exportados-con-variantes.csv")
      toast.success(
        "CSV generado correctamente (1 fila por variante de producto)"
      )
      resetExport()
    },
    onError: error => {
      console.error(error)
      Sentry.captureException(error, {
        tags: { section: "item-export" }
      })
      toast.error("No se pudo exportar los productos")
      resetExport()
    }
  })

  const handleExportMenu = async () => {
    await exportItems()
  }

  const validateRow = (row: CSVRow, _index: number): string[] => {
    const errors: string[] = []

    if (!row.nombre?.trim()) {
      errors.push("El nombre es requerido")
    }

    if (!row.precio) {
      errors.push("El precio es requerido")
    } else {
      const price = parseFloat(row.precio)
      if (isNaN(price) || price < 0) {
        errors.push("El precio debe ser un número positivo")
      }
    }

    if (row.moneda) {
      const m = row.moneda.trim().toUpperCase()
      if (!(m === "MXN" || m === "USD")) {
        errors.push("Moneda inválida (usar MXN o USD)")
      }
    }

    return errors
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setErrors([])

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "utf-8",
      complete: results => {
        if (results.data.length === 0) {
          setErrors([{ row: 0, errors: ["El archivo está vacío"] }])
          return
        }

        if (results.data.length > 50) {
          setErrors([
            {
              row: 0,
              errors: ["No puedes importar más de 50 productos a la vez"]
            }
          ])
          return
        }

        const foundErrors: ImportError[] = []
        const validItems: BulkMenuItem[] = []

        results.data.forEach((row, index) => {
          const rowErrors = validateRow(row, index)
          if (rowErrors.length > 0) {
            foundErrors.push({
              row: index + 1,
              errors: rowErrors
            })
          } else {
            const currency = (row.moneda ?? "MXN").trim().toUpperCase()
            validItems.push({
              name: row.nombre,
              variantName: row.variante?.trim() || undefined,
              description: row.descripcion,
              price: parseFloat(row.precio),
              status: MenuItemStatus.ACTIVE,
              category: row.categoria,
              currency: currency === "USD" ? "USD" : "MXN"
            })
          }
        })

        if (foundErrors.length > 0) {
          setErrors(foundErrors)
          return
        }

        execute(validItems)
      },
      error: error => {
        setErrors([
          { row: 0, errors: [`Error al procesar el archivo: ${error.message}`] }
        ])
      }
    })
  }

  const handleDownloadTemplate = () => {
    const template: CSVRow[] = [
      {
        nombre: "Producto ejemplo",
        variante: "Regular",
        descripcion: "Descripcion del producto",
        precio: "100.00",
        categoria: "Categoria (opcional)",
        moneda: "MXN"
      },
      {
        nombre: "Producto ejemplo",
        variante: "Grande",
        descripcion: "Descripcion del producto",
        precio: "120.00",
        categoria: "Categoria (opcional)",
        moneda: "MXN"
      }
    ]

    downloadCsvFile(template, "plantilla-productos.csv")
  }

  if (isMobile) {
    return null
  }

  return (
    <>
      <ButtonGroup className="gap-0">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            setErrors([])
            setOpen(true)
          }}
          disabled={isExporting}
        >
          {isPending ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          Importar Productos
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Más acciones"
              disabled={isPending || isExporting}
            >
              {isExporting ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={handleExportMenu}
              disabled={isPending || isExporting}
            >
              <Download className="size-4" />
              Exportar Productos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>

      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          {isPending && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center
                justify-center gap-2 rounded-lg bg-white/80 text-gray-900
                backdrop-blur dark:bg-gray-950/80 dark:text-gray-100"
            >
              <Loader className="size-6 animate-spin" />
              <p className="text-sm font-medium">Importando productos...</p>
            </div>
          )}
          <DialogHeader>
            <DialogTitle className="text-balance">
              Importar productos
            </DialogTitle>
            <DialogDescription className="text-pretty">
              Elige cómo quieres importar tus productos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-start gap-3">
                <FileSpreadsheet className="text-muted-foreground size-5" />
                <div>
                  <p className="font-medium">Importar desde CSV</p>
                  <p className="text-muted-foreground text-sm text-pretty">
                    Sube un archivo CSV con las columnas: nombre, descripcion
                    (opcional), variante (opcional), precio y categoria
                    (opcional).
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                className="mb-4"
                onClick={handleDownloadTemplate}
                disabled={isPending}
              >
                <FileSpreadsheet className="mr-1" />
                Descargar plantilla CSV de ejemplo
              </Button>

              {errors.length > 0 && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Errores en el archivo</AlertTitle>
                  <AlertDescription>
                    <ul className="list-inside list-disc">
                      {errors.map((error, i) => (
                        <li key={i}>
                          Fila {error.row}: {error.errors.join(", ")}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isPending}
                aria-busy={isPending}
                className="file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90 cursor-pointer file:mr-4
                  file:cursor-pointer file:rounded-md file:border-0 file:px-4
                  file:py-2 file:text-sm file:font-semibold
                  disabled:cursor-not-allowed"
              />
            </div>
            <div className="relative">
              <div
                className="animate-rotate-slow pointer-events-none absolute
                  inset-0 rounded-lg bg-linear-to-r from-indigo-600 via-pink-600
                  to-orange-600 opacity-50 blur-xs"
              ></div>
              <div
                className="bg-background relative rounded-lg p-4 ring-1
                  ring-black/10 dark:ring-white/15"
              >
                <div className="mb-3 flex items-start gap-3">
                  <FileText className="text-muted-foreground size-5" />
                  <div>
                    <p className="font-medium">
                      Importar desde PDF o imagen con IA
                    </p>
                    <p className="text-muted-foreground text-sm text-pretty">
                      Usa el nuevo flujo con IA para extraer productos desde una
                      carta, PDF o imagen de menú.
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" disabled={isPending}>
                  <Link href="/dashboard/menu-items/menu-import">
                    Importar tu menú con IA
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
