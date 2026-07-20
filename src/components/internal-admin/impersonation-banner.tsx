"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function ImpersonationBanner() {
  const { data: session } = authClient.useSession()
  const router = useRouter()
  const [isStopping, setIsStopping] = useState(false)

  if (!session?.session.impersonatedBy) {
    return null
  }

  const stopImpersonating = async () => {
    setIsStopping(true)
    const result = await authClient.admin.stopImpersonating()

    if (result.error) {
      toast.error(result.error.message ?? "No se pudo detener la impersonación")
      setIsStopping(false)
      return
    }

    router.push("/internal/users")
    router.refresh()
  }

  return (
    <div
      className="bg-amber-100 text-amber-950 dark:bg-amber-950
        dark:text-amber-50"
    >
      <div
        className="mx-auto flex max-w-7xl items-center justify-between gap-4
          px-4 py-2 text-sm sm:px-6 lg:px-8"
      >
        <p className="flex items-center gap-2">
          <AlertTriangle className="size-4 shrink-0" />
          Estás usando la aplicación como {session.user.name}.
        </p>
        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={isStopping}
          onClick={stopImpersonating}
        >
          {isStopping && <Loader2 className="animate-spin" />}
          Detener
        </Button>
      </div>
    </div>
  )
}
