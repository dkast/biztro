"use client"

import toast from "react-hot-toast"
import type { Menu } from "@prisma/client"
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
import { deleteMenu } from "@/server/actions/menu/mutations"

export default function MenuDelete({
  menu,
  open,
  setOpen
}: {
  menu: Menu
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const { execute, reset } = useAction(deleteMenu, {
    onExecute: () => {
      toast.loading("Eliminando Menú...")
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

  const onDeleteMenu = () => {
    execute({ id: menu.id, organizationId: menu.organizationId })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Menú</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de eliminar este menú? Esta acción no se puede
            deshacer
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => onDeleteMenu()}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
