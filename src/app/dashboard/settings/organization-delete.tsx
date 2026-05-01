"use client"

import { useState } from "react"
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
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { deleteOrganization } from "@/server/actions/organization/mutations"
import { cn } from "@/lib/utils"

const CONFIRMATION_WORD = "ELIMINAR"

function OrganizationDelete({ organizationId }: { organizationId: string }) {
  const router = useRouter()
  const [confirmation, setConfirmation] = useState("")

  const hasConfirmed = confirmation.trim().toUpperCase() === CONFIRMATION_WORD

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
        router.push("/")
        reset()
      }
    },
    onError: () => {
      toast.error("No se pudo eliminar la organización")
      reset()
    }
  })

  const handleDelete = () => {
    if (!hasConfirmed) {
      return
    }

    execute({
      id: organizationId,
      confirmation
    })
  }

  return (
    <>
      <Separator className="my-8" />
      <AlertDialog>
        <Card className="border-destructive/50 border bg-transparent">
          <CardHeader>
            <CardTitle className="text-base text-red-500 dark:text-red-400">
              Eliminar Organización
            </CardTitle>
          </CardHeader>
          <CardContent
            className="flex flex-col items-start justify-center gap-x-8 gap-y-4
              sm:flex-row sm:items-center"
          >
            <p className="text-gray-500">
              Eliminar la organización, catalogos y menus asociados a la misma.{" "}
              <span className="text-red-500 dark:text-red-400">
                Esta operación es irreversible.
              </span>
            </p>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                Eliminar Organización
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar Organización</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="flex flex-col gap-8">
                    <div>
                      ¿Estás seguro que deseas eliminar la organización? Esta
                      acción es irreversible. Todos los datos asociados a la
                      organización serán eliminados y no podrán ser recuperados.
                      Asegurese de haber descargado todos los datos que desea
                      conservar antes de continuar.{" "}
                      <Link
                        href="/dashboard/settings/billing"
                        prefetch={false}
                        className="text-blue-600 underline underline-offset-2
                          hover:text-blue-800"
                      >
                        Cancele su suscripción antes de eliminar la
                        organización.
                      </Link>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-muted-foreground text-xs">
                        Por seguridad escribe{" "}
                        <strong>{CONFIRMATION_WORD}</strong> y presiona
                        eliminar.
                      </p>
                      <Input
                        placeholder={CONFIRMATION_WORD}
                        value={confirmation}
                        onChange={event => setConfirmation(event.target.value)}
                        aria-label="Confirma escribiendo ELIMINAR"
                      />
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter
                className="flex flex-col gap-2 sm:flex-row sm:justify-end
                  sm:gap-4"
              >
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  disabled={!hasConfirmed}
                  onClick={handleDelete}
                  className={cn(buttonVariants({ variant: "destructive" }))}
                >
                  Eliminar Organización
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
