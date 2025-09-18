"use client"

import toast from "react-hot-toast"
import type { Category } from "@prisma/client"
import { useAction } from "next-safe-action/hooks"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { deleteCategory } from "@/server/actions/item/mutations"

export default function ItemDelete({
  category,
  children
}: {
  category: Category
  children: React.ReactNode
}) {
  const { execute, reset } = useAction(deleteCategory, {
    onExecute: () => {
      toast("Eliminando categoría")
    },
    onSuccess: async ({ data }) => {
      // onSuccess not triggered when using revalidateTag in the action
      // see https://github.com/TheEdoRan/next-safe-action/issues/376
      if (data?.success) {
        toast.success("Categoría eliminada")
      } else if (data?.failure?.reason) {
        toast.error(data?.failure?.reason)
      }
      reset()
    },
    onError: () => {
      toast.dismiss()
      toast.error("Algo salió mal")
      reset()
    }
  })

  const onDeleteCategory = () => {
    execute(category)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Categoría</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de eliminar esta categoría? Esta acción no se puede
            deshacer
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => onDeleteCategory()}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
