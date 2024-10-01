"use client"

import toast from "react-hot-toast"
import type { Membership } from "@prisma/client"
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
import { deactivateMember } from "@/server/actions/user/mutations"

export default function MemberDeactivate({
  member,
  open,
  setOpen
}: {
  member: Membership
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const { execute, reset } = useAction(deactivateMember, {
    onExecute: () => {
      toast.loading("Desactivando miembro...")
    },
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
        toast.dismiss()
        toast.error(data.failure.reason)
      } else if (data?.success) {
        toast.dismiss()
        toast.success("Miembro desactivado con éxito")
      }
      reset()
    },
    onError: () => {
      toast.error("Algo salió mal")
      reset()
    }
  })

  const onDeactivateMember = () => {
    execute({ memberId: member.id })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Desactivar Miembro</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas desactivar a este miembro? No podrá
            acceder a la organización hasta que se le vuelva a activar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={event => event.stopPropagation}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={event => {
              event.stopPropagation()
              onDeactivateMember()
            }}
          >
            Desactivar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
