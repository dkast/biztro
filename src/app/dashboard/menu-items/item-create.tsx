"use client"

import toast from "react-hot-toast"
import { Loader, PlusCircle } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { createItem } from "@/server/actions/item/mutations"
import { MenuStatus } from "@/lib/types"

export default function ItemCreate() {
  const router = useRouter()
  const { execute, status, reset } = useAction(createItem, {
    onSuccess: data => {
      if (data.failure?.reason) {
        toast.error(data.failure.reason)
        return
      }
      router.push(`/dashboard/menu-items/new/${data.success?.id}`)
      reset()
    },
    onError: error => {
      console.error(error)
      toast.error("No se pudo crear el producto")
    }
  })

  return (
    <Button
      className="ml-auto gap-2"
      disabled={status === "executing"}
      onClick={() =>
        execute({
          name: "Nuevo producto",
          status: MenuStatus.DRAFT,
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
      {status === "executing" ? (
        <Loader className="size-4 animate-spin" />
      ) : (
        <PlusCircle className="size-4" />
      )}
      Nuevo producto
    </Button>
  )
}
