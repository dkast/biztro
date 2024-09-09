"use client"

import toast from "react-hot-toast"
import type { MenuItem } from "@prisma/client"
import { useAction } from "next-safe-action/hooks"

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
import { deleteItem } from "@/server/actions/item/mutations"

export default function ItemDelete({
  item,
  open,
  setOpen
}: {
  item: MenuItem
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const { execute, reset } = useAction(deleteItem, {
    onExecute: () => {
      toast.loading("Eliminando Producto...")
    },
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
        toast.dismiss()
        toast.error(data.failure.reason)
      } else if (data?.success) {
        toast.dismiss()
      }
      reset()
    },
    onError: () => {
      toast.error("Algo salió mal")
      reset()
    }
  })

  const onDeleteItem = () => {
    execute(item)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Producto</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de eliminar este producto? Esta acción no se puede
            deshacer
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={event => event.stopPropagation()}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={event => {
              event.stopPropagation()
              onDeleteItem()
            }}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
