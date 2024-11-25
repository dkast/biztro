"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { AlertCircle, FileSpreadsheet, Loader, Upload } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Papa from "papaparse"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { bulkCreateItems } from "@/server/actions/item/mutations"
import { MenuItemStatus, type BulkMenuItem } from "@/lib/types"

type CSVRow = {
  nombre: string
  descripcion?: string
  precio: string
  categoria?: string
}

type ImportError = {
  row: number
  errors: string[]
}

export default function ItemImport() {
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState<ImportError[]>([])
  const { execute, isPending } = useAction(bulkCreateItems, {
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
    },
    onError: error => {
      console.error(error)
      toast.error("Error al importar los productos")
    }
  })

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

    return errors
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setErrors([])

    Papa.parse<CSVRow>(file, {
      header: true,
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
            validItems.push({
              name: row.nombre,
              description: row.descripcion,
              price: parseFloat(row.precio),
              status: MenuItemStatus.ACTIVE,
              category: row.categoria
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
    const template = [
      {
        nombre: "Producto ejemplo",
        descripcion: "Descripcion del producto",
        precio: "100.00",
        categoria: "Categoria (opcional)"
      }
    ]

    const csv = Papa.unparse(template)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", "plantilla-productos.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <Button
        variant="secondary"
        className="gap-2"
        onClick={() => {
          setErrors([])
          setOpen(true)
        }}
      >
        {isPending ? (
          <Loader className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        Importar CSV
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar productos desde CSV</DialogTitle>
            <DialogDescription>
              Sube un archivo CSV con las columnas: nombre, descripcion
              (opcional), precio, categoria (opcional)
            </DialogDescription>
          </DialogHeader>

          <Button
            variant="link"
            className="mb-4 h-fit w-fit p-0 text-green-500 dark:text-green-400"
            onClick={handleDownloadTemplate}
          >
            <FileSpreadsheet className="mr-1" />
            Descargar plantilla CSV de ejemplo
          </Button>

          {errors.length > 0 && (
            <Alert variant="destructive">
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
            className="file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:px-4 file:py-2 file:text-sm file:font-semibold"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
