"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
import { BorderBeam } from "border-beam"
import { AlertCircle, FileSpreadsheet, FileText, Loader } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import Papa from "papaparse"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { bulkCreateItems } from "@/server/actions/item/mutations"
import { MenuItemStatus, type BulkMenuItem } from "@/lib/types/menu-item"

type CSVRow = {
  nombre?: string
  variante?: string
  descripcion?: string
  precio?: string
  categoria?: string
  moneda?: string
}

type ImportError = {
  row: number
  errors: string[]
}

type CanonicalHeader = keyof CSVRow

const HEADER_ALIASES: Record<CanonicalHeader, string[]> = {
  nombre: ["nombre", "name", "producto", "product", "productname", "item"],
  variante: ["variante", "variant", "variantname", "size"],
  descripcion: ["descripcion", "description", "desc", "detalle", "detalles"],
  precio: ["precio", "price", "unitprice", "pricevalue", "unitpricevalue"],
  categoria: ["categoria", "category", "group", "section", "family"],
  moneda: ["moneda", "currency", "currencycode", "curr"]
}

function normalizeHeaderValue(header: string) {
  return header
    .trim()
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
}

function normalizeHeader(header: string) {
  const normalized = normalizeHeaderValue(header)

  for (const [canonical, aliases] of Object.entries(HEADER_ALIASES)) {
    if (aliases.some(alias => normalizeHeaderValue(alias) === normalized)) {
      return canonical
    }
  }

  return normalized
}

function parsePriceValue(value: string | undefined) {
  if (!value) {
    return undefined
  }

  const normalized = value.trim().replace(/\s/g, "")
  if (!normalized) {
    return undefined
  }

  const numericValue = normalized.replace(/[^\d,.-]/g, "")
  if (!numericValue) {
    return undefined
  }

  const hasComma = numericValue.includes(",")
  const hasDot = numericValue.includes(".")

  if (hasComma && hasDot) {
    const lastComma = numericValue.lastIndexOf(",")
    const lastDot = numericValue.lastIndexOf(".")
    const decimalSeparator = lastComma > lastDot ? "," : "."
    const sanitized = numericValue.replace(/[,.]/g, char =>
      char === decimalSeparator ? "." : ""
    )
    return Number.parseFloat(sanitized)
  }

  if (hasComma) {
    return Number.parseFloat(numericValue.replace(",", "."))
  }

  return Number.parseFloat(numericValue)
}

function detectDelimiter(text: string) {
  const sample = text.slice(0, 5000)
  const counts = [",", ";", "\t"].map(delimiter => ({
    delimiter,
    count: (sample.match(new RegExp(`\\${delimiter}`, "g")) ?? []).length
  }))

  return (
    counts.sort((left, right) => right.count - left.count)[0]?.delimiter ?? ","
  )
}

function parseCsvRows(text: string) {
  const delimiter = detectDelimiter(text)
  const results = Papa.parse<Record<string, string | undefined>>(text, {
    header: true,
    skipEmptyLines: true,
    delimiter,
    transformHeader: header => normalizeHeader(header),
    dynamicTyping: false
  })

  if (results.errors.length > 0) {
    const firstError = results.errors[0]
    return {
      error: firstError?.message
        ? `No pudimos procesar el archivo CSV: ${firstError.message}`
        : "No pudimos procesar el archivo CSV"
    }
  }

  const fields = results.meta.fields ?? []
  const hasRequiredColumns =
    fields.includes("nombre") && fields.includes("precio")

  if (!hasRequiredColumns) {
    return {
      error:
        "El archivo debe incluir columnas de nombre y precio. Usa la plantilla descargable para garantizar el formato correcto."
    }
  }

  const rows = (results.data as Array<Record<string, string | undefined>>).map(
    row => ({
      nombre: row.nombre?.trim(),
      variante: row.variante?.trim(),
      descripcion: row.descripcion?.trim(),
      precio: row.precio?.trim(),
      categoria: row.categoria?.trim(),
      moneda: row.moneda?.trim()
    })
  )

  return { rows }
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
    const price = parsePriceValue(row.precio)
    if (typeof price !== "number" || Number.isNaN(price) || price < 0) {
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

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setErrors([])

    try {
      const text = await file.text()
      const parsed = parseCsvRows(text)

      if ("error" in parsed && parsed.error) {
        setErrors([{ row: 0, errors: [parsed.error] }])
        event.target.value = ""
        return
      }

      const rows = parsed.rows ?? []

      if (rows.length === 0) {
        setErrors([{ row: 0, errors: ["El archivo está vacío"] }])
        event.target.value = ""
        return
      }

      if (rows.length > 200) {
        setErrors([
          {
            row: 0,
            errors: ["No puedes importar más de 200 productos a la vez"]
          }
        ])
        event.target.value = ""
        return
      }

      const foundErrors: ImportError[] = []
      const validItems: BulkMenuItem[] = []

      rows.forEach((row, index) => {
        const rowErrors = validateRow(row)

        if (rowErrors.length > 0) {
          foundErrors.push({
            row: index + 1,
            errors: rowErrors
          })
          return
        }

        const price = parsePriceValue(row.precio)
        const currency = (row.moneda ?? "MXN").trim().toUpperCase()

        validItems.push({
          name: row.nombre ?? "",
          variantName: row.variante?.trim() || undefined,
          description: row.descripcion,
          price: typeof price === "number" ? price : 0,
          status: MenuItemStatus.ACTIVE,
          category: row.categoria,
          currency: currency === "USD" ? "USD" : "MXN"
        })
      })

      if (foundErrors.length > 0) {
        setErrors(foundErrors)
        event.target.value = ""
        return
      }

      execute(validItems)
    } catch (error) {
      setErrors([
        {
          row: 0,
          errors: [
            `No pudimos procesar el archivo CSV: ${error instanceof Error ? error.message : "Error desconocido"}`
          ]
        }
      ])
    } finally {
      event.target.value = ""
    }
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
      <BorderBeam size="pulse-outside" colorVariant="colorful" strength={0.5}>
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
      </BorderBeam>

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
