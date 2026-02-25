"use client"

import { useCallback, useRef, useState } from "react"
import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
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

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { bulkCreateItems } from "@/server/actions/item/mutations"
import { parsePdfMenu, type PdfMenuItem } from "@/server/actions/item/pdf-mutations"
import { MenuItemStatus } from "@/lib/types"

type EditableItem = PdfMenuItem & { _id: string }

function generateId() {
  return Math.random().toString(36).slice(2)
}

export default function PdfImportForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<EditableItem[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  const { execute: executeParse } = useAction(parsePdfMenu, {
    onSuccess: response => {
      if (response.data?.failure) {
        setParseError(response.data.failure.reason)
        setIsParsing(false)
        return
      }
      const extracted = (response.data?.success ?? []).map(item => ({
        ...item,
        _id: generateId()
      }))
      setItems(extracted)
      setIsParsing(false)
    },
    onError: error => {
      console.error(error)
      Sentry.captureException(error, { tags: { section: "pdf-import" } })
      setParseError("Error al procesar el archivo PDF")
      setIsParsing(false)
    }
  })

  const { execute: executeBulkCreate, isPending: isSaving } = useAction(
    bulkCreateItems,
    {
      onSuccess: response => {
        if (response.data?.failure) {
          toast.error(response.data.failure.reason)
          return
        }
        toast.success(
          `${response.data?.success?.length} productos importados correctamente`
        )
        router.push("/dashboard/menu-items")
      },
      onError: error => {
        console.error(error)
        Sentry.captureException(error, { tags: { section: "pdf-import-save" } })
        toast.error("Error al guardar los productos")
      }
    }
  )

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
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
      executeParse({ pdfBase64: base64 })
    }
    reader.onerror = () => {
      setParseError("Error al leer el archivo")
      setIsParsing(false)
    }
    reader.readAsDataURL(selectedFile)
  }, [selectedFile, executeParse])

  const handleUpdateItem = (
    id: string,
    field: keyof PdfMenuItem,
    value: string | number
  ) => {
    setItems(prev =>
      prev.map(item => (item._id === id ? { ...item, [field]: value } : item))
    )
  }

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item._id !== id))
  }

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        _id: generateId(),
        name: "",
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
      <div className="flex flex-col gap-3">
        <div
          className="flex cursor-pointer flex-col items-center justify-center
            gap-3 rounded-lg border-2 border-dashed border-gray-300 p-8
            transition-colors hover:border-gray-400 hover:bg-gray-50
            dark:border-gray-700 dark:hover:border-gray-600
            dark:hover:bg-gray-900/50"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileText className="text-muted-foreground size-10" />
          <div className="text-center">
            <p className="text-sm font-medium">
              {selectedFile ? selectedFile.name : "Selecciona un archivo PDF"}
            </p>
            <p className="text-muted-foreground text-xs">
              Haz clic para seleccionar un PDF de tu menú
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
            {isParsing ? "Extrayendo productos..." : "Extraer productos del PDF"}
          </Button>
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
            <p className="text-sm font-medium">
              {items.length} producto{items.length !== 1 ? "s" : ""} extraído
              {items.length !== 1 ? "s" : ""}. Revisa y edita antes de guardar.
            </p>
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

          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Nombre *</TableHead>
                  <TableHead className="min-w-[220px]">Descripción</TableHead>
                  <TableHead className="min-w-[100px]">Precio *</TableHead>
                  <TableHead className="min-w-[130px]">Categoría</TableHead>
                  <TableHead className="min-w-[90px]">Moneda</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <Input
                        value={item.name}
                        onChange={e =>
                          handleUpdateItem(item._id, "name", e.target.value)
                        }
                        placeholder="Nombre del producto"
                        disabled={isSaving}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.description ?? ""}
                        onChange={e =>
                          handleUpdateItem(
                            item._id,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Descripción"
                        disabled={isSaving}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.price}
                        onChange={e =>
                          handleUpdateItem(
                            item._id,
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        disabled={isSaving}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.category ?? ""}
                        onChange={e =>
                          handleUpdateItem(
                            item._id,
                            "category",
                            e.target.value
                          )
                        }
                        placeholder="Categoría"
                        disabled={isSaving}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        value={item.currency ?? "MXN"}
                        onChange={e =>
                          handleUpdateItem(
                            item._id,
                            "currency",
                            e.target.value as "MXN" | "USD"
                          )
                        }
                        disabled={isSaving}
                        className="border-input bg-background text-foreground h-8
                          w-full rounded-md border px-2 text-sm"
                      >
                        <option value="MXN">MXN</option>
                        <option value="USD">USD</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(item._id)}
                        disabled={isSaving}
                        className="size-8"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
