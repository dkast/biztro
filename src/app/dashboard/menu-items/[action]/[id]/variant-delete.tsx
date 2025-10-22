"use client"

import toast from "react-hot-toast"
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
import { buttonVariants } from "@/components/ui/button"
import { deleteVariant } from "@/server/actions/item/mutations"
import { cn } from "@/lib/utils"

export default function VariantDelete({
  children,
  variantId,
  menuItemId
}: {
  children: React.ReactNode
  variantId: string | undefined
  menuItemId: string | undefined
}) {
  const { execute, reset } = useAction(deleteVariant, {
    onExecute: () => {
      toast.loading("Eliminando Variante...")
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
    onError: error => {
      console.error(error)
      toast.dismiss()
      toast.error("Algo salió mal")
      reset()
    }
  })

  const onDeleteVariant = () => {
    execute({
      id: variantId ?? "",
      menuItemId: menuItemId ?? ""
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Variante</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de eliminar esta variante? Esta acción no se puede
            deshacer
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={() => onDeleteVariant()}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
