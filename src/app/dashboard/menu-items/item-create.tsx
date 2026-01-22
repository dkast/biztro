"use client"

import { useState, useTransition } from "react"
import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
import { Loader, PlusCircle } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { usePostHog } from "posthog-js/react"

import { UpgradeDialog } from "@/components/dashboard/upgrade-dialog"
import { Button } from "@/components/ui/button"
import { createItem } from "@/server/actions/item/mutations"
import { appConfig } from "@/app/config"
import { BasicPlanLimits, MenuItemStatus } from "@/lib/types"

export default function ItemCreate() {
  const [isPending, startTransition] = useTransition()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const router = useRouter()
  const posthog = usePostHog()
  
  const { execute, status, reset } = useAction(createItem, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
        if (data.failure.code === BasicPlanLimits.ITEM_LIMIT_REACHED) {
          setShowUpgrade(true)
        } else {
          toast.error(data.failure.reason)
        }
        reset()
        return
      }
      
      // Track item creation
      if (data?.success) {
        posthog.capture("item_created", {
          item_id: data.success.id,
          organization_id: data.success.organizationId,
          category_id: data.success.categoryId,
          source: "dashboard"
        })
      }
      
      startTransition(() => {
        router.push(`/dashboard/menu-items/new/${data?.success?.id}`)
        reset()
      })
    },
    onError: error => {
      console.error(error)
      Sentry.captureException(error, {
        tags: { section: "item-create" }
      })
      toast.error("No se pudo crear el producto")
      reset()
    }
  })

  return (
    <>
      <Button
        className="ml-auto gap-2"
        disabled={status === "executing" || isPending}
        onClick={() =>
          execute({
            name: "Nuevo producto",
            status: MenuItemStatus.DRAFT,
            description: "",
            variants: [
              {
                name: "Regular",
                price: 0
              }
            ]
          })
        }
      >
        {status === "executing" || isPending ? (
          <Loader className="size-4 animate-spin" />
        ) : (
          <PlusCircle className="size-4" />
        )}
        Nuevo producto
      </Button>

      <UpgradeDialog
        title="Obtén más con el plan Pro"
        description={`Has alcanzado el límite de ${appConfig.itemLimit} productos en tu plan gratuito. 
      Considera actualizar a Pro para seguir creando sin restricciones.`}
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
      />
    </>
  )
}
