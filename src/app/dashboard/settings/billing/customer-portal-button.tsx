"use client"

import React, { useState, useTransition } from "react"
import toast from "react-hot-toast"
import { Loader } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { createStripePortal } from "@/server/actions/subscriptions/mutations"

export function CustomerPortalButton({ referenceId }: { referenceId: string }) {
  const router = useRouter()
  const [isSubmitting, setisSubmitting] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleStripePortal = async () => {
    setisSubmitting(true)
    const redirectUrl = await createStripePortal(referenceId)
    if (!redirectUrl) {
      toast.error("No se pudo redirigir al portal de clientes")
      setisSubmitting(false)
    } else {
      setisSubmitting(false)
      startTransition(() => {
        router.push(redirectUrl)
      })
    }
  }

  return (
    <Button
      disabled={isSubmitting || isPending}
      onClick={handleStripePortal}
      className="transition-all"
    >
      {isSubmitting || isPending ? (
        <Loader className="size-4 animate-spin" />
      ) : (
        "Ir a Portal Clientes"
      )}
    </Button>
  )
}
