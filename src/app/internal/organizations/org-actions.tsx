"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { MoreHorizontal } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  setOrganizationBasic,
  setOrganizationSponsored
} from "@/server/actions/internal-admin/mutations"
import { type InternalOrg } from "@/server/actions/internal-admin/queries"

export function OrgActions({ org }: { org: InternalOrg }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const { execute: sponsor, reset: resetSponsor } = useAction(
    setOrganizationSponsored,
    {
      onSuccess: ({ data }) => {
        if (data?.failure?.reason) {
          toast.error(data.failure.reason)
        } else {
          toast.success("Organización marcada como patrocinada")
          router.refresh()
        }
        resetSponsor()
      },
      onError: () => {
        toast.error("Error al actualizar la organización")
        resetSponsor()
      }
    }
  )

  const { execute: setBasic, reset: resetBasic } = useAction(
    setOrganizationBasic,
    {
      onSuccess: ({ data }) => {
        if (data?.failure?.reason) {
          toast.error(data.failure.reason)
        } else {
          toast.success("Organización degradada a plan Básico")
          router.refresh()
        }
        resetBasic()
      },
      onError: () => {
        toast.error("Error al actualizar la organización")
        resetBasic()
      }
    }
  )

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Acciones de organización</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
          {org.name}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {org.hasActiveStripeSubscription ? (
          <DropdownMenuItem disabled>
            Suscripción activa: gestionar en Stripe
          </DropdownMenuItem>
        ) : (
          <>
            {org.plan !== "PRO" || org.status !== "SPONSORED" ? (
              <DropdownMenuItem
                onSelect={() => {
                  setOpen(false)
                  sponsor({ orgId: org.id })
                }}
              >
                Marcar como patrocinada (PRO)
              </DropdownMenuItem>
            ) : null}
            {org.status === "SPONSORED" || org.plan === "PRO" ? (
              <DropdownMenuItem
                className="text-destructive"
                onSelect={() => {
                  setOpen(false)
                  setBasic({ orgId: org.id })
                }}
              >
                Degradar a plan Básico
              </DropdownMenuItem>
            ) : null}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
