"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { AlertCircle, Loader, Upload } from "lucide-react"
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

export default function ImportItems() {
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState<ImportError[]>([])
  const { execute, isPending } = useAction(bulkCreateItems, {
    onSuccess: ({ data }) => {
      if (data?.failure) {
        toast.error(data.failure.reason)
        return
      }
      toast.success(
        `${data?.success?.length} productos importados correctamente`
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
              status: MenuItemStatus.ACTIVE
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
