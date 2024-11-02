"use client"

import { useState, useTransition } from "react"
import toast from "react-hot-toast"
import { Loader, PlusCircle } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { UpgradeDialog } from "@/components/ui/upgrade-dialog"
import { createItem } from "@/server/actions/item/mutations"
import { MenuItemStatus } from "@/lib/types"

export default function ItemCreate() {
  const [isPending, startTransition] = useTransition()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const router = useRouter()
  const { execute, status, reset } = useAction(createItem, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
        if (data.failure.reason.includes("Actualizar a Pro")) {
          setShowUpgrade(true)
        } else {
          toast.error(data.failure.reason)
        }
        return
      }
      startTransition(() => {
        router.push(`/dashboard/menu-items/new/${data?.success?.id}`)
        reset()
      })
    },
    onError: error => {
      console.error(error)
      toast.error("No se pudo crear el producto")
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

      <UpgradeDialog open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  )
}
