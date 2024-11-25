import { useState } from "react"
import { toast } from "react-hot-toast"
import type { Category, Prisma } from "@prisma/client"
import { SelectTrigger } from "@radix-ui/react-select"
import type { Table } from "@tanstack/react-table"
import { Combine, Loader, Trash2, X } from "lucide-react"
import { useAction } from "next-safe-action/hooks"

import { TooltipHelper } from "@/components/dashboard/tooltip-helper"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  bulkDeleteItems,
  bulkUpdateCategory
} from "@/server/actions/item/mutations"
import type { getMenuItems } from "@/server/actions/item/queries"

function FloatingToolbar({
  table,
  categories
}: {
  table: Table<Prisma.PromiseReturnType<typeof getMenuItems>[0]>
  categories: Category[]
}) {
  const { execute: executeBulkUpdate, isPending: updateIsPending } = useAction(
    bulkUpdateCategory,
    {
      onSuccess: ({ data }) => {
        if (data?.failure) {
          toast.error(data.failure.reason)
          return
        }
        toast.success("Categorías actualizadas")
        table.toggleAllRowsSelected(false)
      }
    }
  )

  const { execute: executeBulkDelete, isPending: deleteIsPending } = useAction(
    bulkDeleteItems,
    {
      onSuccess: ({ data }) => {
        if (data?.failure) {
          toast.error(data.failure.reason)
          return
        }
        toast.success("Productos eliminados")
        table.toggleAllRowsSelected(false)
      }
    }
  )

  const rows = table.getFilteredSelectedRowModel().rows
  const selectedIds = rows.map(row => row.original.id)
  const orgId = rows[0]?.original.organizationId

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleUpdateCategory = async (categoryId: string) => {
    if (!orgId || selectedIds.length === 0) return

    await executeBulkUpdate({
      ids: selectedIds,
      categoryId,
      organizationId: orgId
    })
  }

  const handleDelete = async () => {
    if (!orgId || selectedIds.length === 0) return
    try {
      await executeBulkDelete({
        ids: selectedIds,
        organizationId: orgId
      })
      setShowDeleteDialog(false)
    } catch (error) {
      console.error("Error deleting items:", error)
      // Add appropriate error handling/notification
    }
  }

  return (
    <div className="mx-auto flex w-fit items-center gap-2">
      <div className="flex h-7 items-center rounded-full border border-dashed border-gray-600 pl-2.5 pr-1 dark:border-gray-700">
        <span className="whitespace-nowrap text-xs">
          {rows.length} seleccionado(s)
        </span>
        <Separator orientation="vertical" className="ml-2 mr-1 bg-gray-600" />
        <TooltipHelper content="Deseleccionar todo">
          <Button
            variant="ghost"
            size="icon"
            className="size-5 hover:border"
            onClick={() => table.toggleAllRowsSelected(false)}
          >
            <X className="size-3.5 shrink-0" aria-hidden="true" />
          </Button>
        </TooltipHelper>
      </div>
      <Separator orientation="vertical" className="mx-1" />
      <Select onValueChange={handleUpdateCategory}>
        <TooltipHelper content="Actualizar categoría">
          <SelectTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-full"
              disabled={updateIsPending}
            >
              {updateIsPending ? (
                <Loader className="size-3.5 animate-spin" />
              ) : (
                <Combine className="size-3.5" />
              )}
            </Button>
          </SelectTrigger>
        </TooltipHelper>
        <SelectContent align="center">
          <SelectGroup>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <TooltipHelper content="Eliminar">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 rounded-full"
          disabled={deleteIsPending}
          onClick={() => setShowDeleteDialog(true)}
        >
          {deleteIsPending ? (
            <Loader className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
        </Button>
      </TooltipHelper>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán{" "}
              {selectedIds.length} productos seleccionados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} variant="destructive">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default FloatingToolbar
