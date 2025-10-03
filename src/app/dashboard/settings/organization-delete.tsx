"use client"

import toast from "react-hot-toast"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { deleteOrganization } from "@/server/actions/organization/mutations"

function OrganizationDelete({ organizationId }: { organizationId: string }) {
  const router = useRouter()

  const { execute, reset } = useAction(deleteOrganization, {
    onExecute: () => {
      toast("Eliminando organización...", { icon: "🗑️", duration: 2000 })
    },
    onSuccess: ({ data }) => {
      toast.dismiss()
      if (data?.failure) {
        toast.error(
          data.failure.reason ?? "No se pudo eliminar la organización"
        )
      } else {
        router.push("/login")
        reset()
      }
    },
    onError: () => {
      toast.error("No se pudo eliminar la organización")
      reset()
    }
  })

  const handleDelete = () => {
    execute({
      id: organizationId
    })
  }

  return (
    <>
      <Separator className="my-8" />
      <AlertDialog>
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-base text-red-500">
              Eliminar Organización
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-start justify-center gap-x-8 gap-y-4 sm:flex-row sm:items-center">
            <p className="text-gray-500">
              Eliminar la organización, catalogos y menus asociados a la misma.{" "}
              <span className="text-red-500 dark:text-red-400">
                Esta operación es irreversible.
              </span>
            </p>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Eliminar Organización</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar Organización</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro que deseas eliminar la organización? Esta acción
                  es irreversible. Todos los datos asociados a la organización
                  serán eliminados y no podrán ser recuperados. Asegurese de
                  haber descargado todos los datos que desea conservar antes de
                  continuar.{" "}
                  <Link
                    href="settings/billing"
                    className="text-blue-600 underline underline-offset-2 hover:text-blue-800"
                  >
                    Cancele su suscripción antes de eliminar la organización.
                  </Link>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => {
                    handleDelete()
                  }}
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </CardContent>
        </Card>
      </AlertDialog>
    </>
  )
}
export default OrganizationDelete
