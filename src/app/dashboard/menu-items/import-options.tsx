"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
import { AlertCircle, FileSpreadsheet, FileText, Loader } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import Papa from "papaparse"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { bulkCreateItems } from "@/server/actions/item/mutations"
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

function downloadCsvFile(rows: CSVRow[], fileName: string) {
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

function getTemplateRows(): CSVRow[] {
  return [
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
}

function validateRow(row: CSVRow): string[] {
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
    const currency = row.moneda.trim().toUpperCase()
    if (!(currency === "MXN" || currency === "USD")) {
      errors.push("Moneda no válida. Usa MXN o USD.")
    }
  }

  return errors
}

export default function MenuImportOptions({
  aiImportHref,
  onCsvSuccess
}: {
  aiImportHref: string
  onCsvSuccess?: (createdCount: number) => void
}) {
  const [errors, setErrors] = useState<ImportError[]>([])

  const { execute, isPending, reset } = useAction(bulkCreateItems, {
    onSuccess: response => {
      if (response.data?.failure) {
        toast.error(response.data.failure.reason)
        reset()
        return
      }

      const createdCount = response.data?.success?.length ?? 0
      toast.success(`${createdCount} productos importados correctamente`)
      setErrors([])
      onCsvSuccess?.(createdCount)
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

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

        if (results.data.length > 200) {
          setErrors([
            {
              row: 0,
              errors: ["No puedes importar más de 200 productos a la vez"]
            }
          ])
          return
        }

        const foundErrors: ImportError[] = []
        const validItems: BulkMenuItem[] = []

        results.data.forEach((row, index) => {
          const rowErrors = validateRow(row)

          if (rowErrors.length > 0) {
            foundErrors.push({
              row: index + 1,
              errors: rowErrors
            })
            return
          }

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
        })

        if (foundErrors.length > 0) {
          setErrors(foundErrors)
          return
        }

        execute(validItems)
      },
      error: error => {
        setErrors([
          {
            row: 0,
            errors: [`No pudimos procesar el archivo CSV: ${error.message}`]
          }
        ])
      }
    })
  }

  return (
    <div className="relative space-y-4">
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
      <div className="relative">
        <div
          className="animate-rotate-slow pointer-events-none absolute inset-0
            rounded-lg bg-linear-to-r from-indigo-600 via-pink-600 to-orange-600
            opacity-50 blur-xs"
        />
        <div
          className="bg-background relative rounded-2xl p-4 ring-1 ring-black/10
            dark:ring-white/15"
        >
          <div className="mb-3 flex items-start gap-3">
            <FileText className="text-muted-foreground size-5" />
            <div>
              <p className="font-medium">
                Importar menú desde PDF o imagen con IA
              </p>
              <p className="text-muted-foreground text-sm text-pretty">
                Usa la importación con IA para extraer productos desde una
                carta, PDF o imagen de menú.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" disabled={isPending}>
            <Link href={aiImportHref} prefetch={false}>
              Importar menú con IA
            </Link>
          </Button>
        </div>
      </div>

      <div
        className="border-border/60 bg-background rounded-2xl border p-5
          shadow-sm"
      >
        <div className="mb-3 flex items-start gap-3">
          <FileSpreadsheet className="text-muted-foreground size-5" />
          <div>
            <p className="font-medium">Importar desde CSV</p>
            <p className="text-muted-foreground text-sm text-pretty">
              Sube un CSV con estas columnas: nombre y precio obligatorios;
              descripción, variante, categoría y moneda son opcionales.
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-full justify-start sm:w-fit"
            onClick={() =>
              downloadCsvFile(getTemplateRows(), "plantilla-productos.csv")
            }
            disabled={isPending}
          >
            <FileSpreadsheet className="mr-1" />
            Descargar plantilla CSV
          </Button>

          <div className="space-y-2">
            <p className="text-sm font-medium">Subir archivo CSV</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isPending}
              aria-busy={isPending}
              className="border-border bg-background file:bg-primary
                file:text-primary-foreground hover:file:bg-primary/90
                focus-visible:ring-ring block w-full cursor-pointer rounded-lg
                border text-sm shadow-sm file:mr-4 file:cursor-pointer
                file:rounded-md file:border-0 file:px-4 file:py-2 file:text-sm
                file:font-semibold focus-visible:ring-2
                focus-visible:ring-offset-2 focus-visible:outline-none
                disabled:cursor-not-allowed disabled:opacity-60
                motion-safe:transition-colors"
            />
          </div>
        </div>

        {errors.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="size-4" />
            <AlertTitle>Errores en el archivo</AlertTitle>
            <AlertDescription>
              <ul className="list-inside list-disc">
                {errors.map((error, index) => (
                  <li key={`${error.row}-${index}`}>
                    Fila {error.row}: {error.errors.join(", ")}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
