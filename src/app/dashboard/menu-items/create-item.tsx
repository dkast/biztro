"use client"

import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { createItem } from "@/server/actions/item/mutations"

export default function CreateItem() {
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
      className="ml-auto"
      disabled={status === "executing"}
      variant={status === "executing" ? "secondary" : "default"}
      onClick={() =>
        execute({
          name: "Nuevo producto",
          description: ""
        })
      }
    >
      {status === "executing" && (
        <Loader2 className="mr-2 size-4 animate-spin" />
      )}
      Nuevo producto
    </Button>
  )
}
