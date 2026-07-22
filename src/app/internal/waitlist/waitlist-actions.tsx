"use client"

import toast from "react-hot-toast"
import { MoreHorizontal } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  activateWaitlistEntry,
  deactivateWaitlistEntry
} from "@/server/actions/internal-admin/mutations"
import { type InternalWaitlistEntry } from "@/server/actions/internal-admin/queries"

export function WaitlistActions({ entry }: { entry: InternalWaitlistEntry }) {
  const router = useRouter()

  const { execute: activate, reset: resetActivate } = useAction(
    activateWaitlistEntry,
    {
      onSuccess: ({ data }) => {
        if (data?.failure?.reason) {
          toast.error(data.failure.reason)
        } else {
          toast.success("Entrada habilitada")
          router.refresh()
        }
        resetActivate()
      },
      onError: () => {
        toast.error("Error al habilitar la entrada")
        resetActivate()
      }
    }
  )

  const { execute: deactivate, reset: resetDeactivate } = useAction(
    deactivateWaitlistEntry,
    {
      onSuccess: ({ data }) => {
        if (data?.failure?.reason) {
          toast.error(data.failure.reason)
        } else {
          toast.success("Entrada deshabilitada")
          router.refresh()
        }
        resetDeactivate()
      },
      onError: () => {
        toast.error("Error al deshabilitar la entrada")
        resetDeactivate()
      }
    }
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Acciones de lista de espera</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!entry.enabled ? (
          <DropdownMenuItem onSelect={() => activate({ id: entry.id })}>
            Habilitar
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="text-destructive"
            onSelect={() => deactivate({ id: entry.id })}
          >
            Deshabilitar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
