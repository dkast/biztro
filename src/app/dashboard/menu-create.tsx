"use client"

import toast from "react-hot-toast"
import { motion } from "framer-motion"
import { CirclePlus } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"

import { createMenu } from "@/server/actions/menu/mutations"

export default function MenuCreate() {
  const router = useRouter()
  const { execute, status, reset } = useAction(createMenu, {
    onExecute: () => {
      toast.loading("Creando menú...")
    },
    onSuccess: data => {
      if (data.failure?.reason) {
        toast.dismiss()
        toast.error(data.failure.reason)
        return
      }
      toast.dismiss()
      router.push(`/menu-editor/${data.success?.id}`)
      reset()
    },
    onError: error => {
      console.error(error)
      toast.dismiss()
      toast.error("No se pudo crear el producto")
    }
  })

  return (
    <motion.button
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      className="flex h-[370px] flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-300 text-gray-400"
      disabled={status === "executing"}
      onClick={() =>
        execute({
          name: "Nuevo menú",
          description: "",
          status: "DRAFT"
        })
      }
    >
      <CirclePlus className="size-10" />
      Crear menú
    </motion.button>
  )
}