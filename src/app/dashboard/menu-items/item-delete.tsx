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
  data,
  open,
  setOpen
}: {
  data: MenuItem
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const { execute, reset } = useAction(deleteItem, {
    onExecute: () => {
      toast.loading("Eliminando Unidad...")
    },
    onSuccess: data => {
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

  const onDeleteVehicle = () => {
    execute(data)
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
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => onDeleteVehicle()}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
