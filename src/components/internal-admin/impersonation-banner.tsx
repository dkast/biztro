"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { Ring } from "loading-dev"
import { AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  Banner,
  BannerAction,
  BannerIcon,
  BannerTitle
} from "@/components/kibo-ui/banner"
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
    <Banner className="sticky inset-x-0 top-0 bg-orange-400 dark:bg-orange-600">
      <BannerIcon icon={AlertTriangle} className="shrink-0" />
      <BannerTitle>
        Estás usando la aplicación como {session.user.name}.
      </BannerTitle>
      <BannerAction
        type="button"
        size="xs"
        disabled={isStopping}
        onClick={stopImpersonating}
      >
        {isStopping && <Ring size={16} />}
        Detener
      </BannerAction>
    </Banner>
  )
}
