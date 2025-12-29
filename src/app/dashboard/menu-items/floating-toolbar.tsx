import { useState } from "react"
import { toast } from "react-hot-toast"
import type { Category } from "@/generated/prisma-client/client"
import type { Table } from "@tanstack/react-table"
import { Combine, Loader, Star, Trash2, X } from "lucide-react"
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
import { Button, buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  bulkDeleteItems,
  bulkToggleFeature,
  bulkUpdateCategory
} from "@/server/actions/item/mutations"
import type { getMenuItems } from "@/server/actions/item/queries"
import { syncMenusAfterCatalogChange } from "@/server/actions/menu/sync"
import { cn } from "@/lib/utils"

function FloatingToolbar({
  table,
  categories
}: {
  table: Table<Awaited<ReturnType<typeof getMenuItems>>[0]>
  categories: Category[]
}) {
  const rows = table.getFilteredSelectedRowModel().rows
  const selectedIds = rows.map(row => row.original.id)
  const orgId = rows[0]?.original.organizationId
  const hasSelection = selectedIds.length > 0

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [syncPrompt, setSyncPrompt] = useState({
    open: false,
    organizationId: orgId ?? "",
    rememberChoice: false
  })

  const {
    execute: executeSyncMenus,
    status: statusSyncMenus,
    reset: resetSyncMenus
  } = useAction(syncMenusAfterCatalogChange, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        const { draftsUpdated, publishedUpdated } = data.success
        if (draftsUpdated || publishedUpdated) {
          toast.success("Menú actualizado")
        }
      } else if (data?.failure?.reason) {
        toast.error(data.failure.reason)
      }
      resetSyncMenus()
      setSyncPrompt(prev => ({ ...prev, open: false, rememberChoice: false }))
      table.toggleAllRowsSelected(false)
    },
    onError: () => {
      toast.error("No se pudo actualizar los menús")
      setSyncPrompt(prev => ({ ...prev, open: false }))
    }
  })

  const { execute: executeBulkUpdate, isPending: updateIsPending } = useAction(
    bulkUpdateCategory,
    {
      onSuccess: ({ data }) => {
        if (data?.failure) {
          toast.error(data.failure.reason)
          return
        }
        toast.success("Categorías actualizadas")

        const syncMeta = data?.success?.sync
        if (syncMeta?.publishedUpdated) {
          toast.success("Menú publicado actualizado")
        }

        if (syncMeta?.needsPublishedDecision) {
          setSyncPrompt(prev => ({
            ...prev,
            open: true,
            rememberChoice: false,
            organizationId: orgId ?? ""
          }))
        } else {
          table.toggleAllRowsSelected(false)
        }
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

  const { execute: executeBulkFeature, isPending: featureIsPending } =
    useAction(bulkToggleFeature, {
      onSuccess: ({ data }) => {
        if (data?.failure) {
          toast.error(data.failure.reason)
          return
        }
        toast.success("Productos actualizados")

        const syncMeta = data?.success?.sync
        if (syncMeta?.publishedUpdated) {
          toast.success("Menú publicado actualizado")
        }

        if (syncMeta?.needsPublishedDecision) {
          setSyncPrompt(prev => ({
            ...prev,
            open: true,
            rememberChoice: false,
            organizationId: orgId ?? ""
          }))
        } else {
          table.toggleAllRowsSelected(false)
        }
      }
    })

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

  const handleToggleFeature = async () => {
    if (!orgId || selectedIds.length === 0 || !rows[0]) return

    // Get current featured status of first selected item to toggle all to opposite
    const firstItem = rows[0].original
    const newFeaturedStatus = !firstItem.featured

    await executeBulkFeature({
      ids: selectedIds,
      featured: newFeaturedStatus,
      organizationId: orgId
    })
  }

  const handleSyncChoice = (updatePublished: boolean) => {
    if (!syncPrompt.organizationId) {
      setSyncPrompt(prev => ({ ...prev, open: false }))
      table.toggleAllRowsSelected(false)
      return
    }

    if (!syncPrompt.rememberChoice && updatePublished === false) {
      setSyncPrompt(prev => ({ ...prev, open: false }))
      table.toggleAllRowsSelected(false)
      return
    }

    executeSyncMenus({
      organizationId: syncPrompt.organizationId,
      updatePublished,
      rememberChoice: syncPrompt.rememberChoice
    })
  }

  return (
    <div className="mx-auto flex w-fit items-center gap-2">
      <div
        className="flex h-7 items-center rounded-full border border-dashed
          border-gray-600 pr-1 pl-2.5 dark:border-gray-700"
      >
        <span className="text-xs whitespace-nowrap">
          {rows.length} seleccionado(s)
        </span>
        <Separator orientation="vertical" className="mr-1 ml-2 bg-gray-600" />
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
      <DropdownMenu>
        <TooltipHelper content="Actualizar categoría">
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-full"
              disabled={updateIsPending || !hasSelection}
            >
              {updateIsPending ? (
                <Loader className="size-3.5 animate-spin" />
              ) : (
                <Combine className="size-3.5" />
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipHelper>
        <DropdownMenuContent>
          <DropdownMenuLabel>Categorías</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {categories.map(category => (
            <DropdownMenuItem
              key={category.id}
              onSelect={() => handleUpdateCategory(category.id)}
              disabled={updateIsPending || !hasSelection}
            >
              {category.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <TooltipHelper content="Recomendado">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 rounded-full"
          disabled={featureIsPending}
          onClick={handleToggleFeature}
        >
          {featureIsPending ? (
            <Loader className="size-3.5 animate-spin" />
          ) : (
            <Star className="size-3.5" />
          )}
        </Button>
      </TooltipHelper>
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
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              onClick={handleDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={syncPrompt.open}
        onOpenChange={open =>
          setSyncPrompt(prev => ({ ...prev, open, rememberChoice: false }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Actualizar menús publicados?</AlertDialogTitle>
            <AlertDialogDescription>
              Se detectaron cambios en tus productos. ¿Quieres aplicar los
              cambios al menú publicado?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember-published-choice-bulk"
              checked={syncPrompt.rememberChoice}
              onCheckedChange={checked =>
                setSyncPrompt(prev => ({
                  ...prev,
                  rememberChoice: checked === true
                }))
              }
            />
            <label
              htmlFor="remember-published-choice-bulk"
              className="text-muted-foreground text-sm"
            >
              No volver a preguntar
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => handleSyncChoice(false)}
              disabled={statusSyncMenus === "executing"}
            >
              No ahora
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleSyncChoice(true)}
              disabled={statusSyncMenus === "executing"}
            >
              {statusSyncMenus === "executing"
                ? "Actualizando..."
                : "Actualizar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default FloatingToolbar
