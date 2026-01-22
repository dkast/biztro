"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { CirclePlus, Loader } from "lucide-react"
import { motion } from "motion/react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { usePostHog } from "posthog-js/react"

import { UpgradeDialog } from "@/components/dashboard/upgrade-dialog"
import { createMenu } from "@/server/actions/menu/mutations"
import { BasicPlanLimits } from "@/lib/types"

export default function MenuCreate() {
  const router = useRouter()
  const posthog = usePostHog()
  const [showUpgrade, setShowUpgrade] = useState(false)

  const { execute, status, reset } = useAction(createMenu, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
        if (data.failure.code === BasicPlanLimits.MENU_LIMIT_REACHED) {
          setShowUpgrade(true)
          reset()
          return
        } else {
          toast.error(data.failure.reason)
          reset()
          return
        }
      }
      
      // Track menu creation
      if (data?.success) {
        posthog.capture("menu_created", {
          menu_id: data.success.id,
          organization_id: data.success.organizationId,
          source: "dashboard"
        })
      }
      
      router.push(`/menu-editor/${data?.success?.id}`)
      reset()
    },
    onError: error => {
      console.error(error)
      Sentry.captureException(error, {
        tags: { section: "menu-create" }
      })
      toast.error("No se pudo crear el menú")
      reset()
    }
  })

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex h-[250px] w-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 dark:border-gray-800 dark:bg-gray-800/20 dark:text-gray-500"
        disabled={status === "executing"}
        onClick={() =>
          execute({
            name: "Nuevo menú",
            description: "",
            status: "DRAFT"
          })
        }
      >
        {status === "executing" ? (
          <Loader className="size-10 animate-spin" />
        ) : (
          <CirclePlus className="size-10" />
        )}
        Crear menú
      </motion.button>

      <UpgradeDialog
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        title="Impulsa tu negocio con el plan Pro"
        description="Actualiza tu plan a Pro para crear más menús y acceder a todas las funciones premium."
      />
    </>
  )
}
