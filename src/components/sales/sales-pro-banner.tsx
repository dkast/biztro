"use client"

import { Crown } from "lucide-react"
import Link from "next/link"

import {
  Banner,
  BannerAction,
  BannerClose,
  BannerIcon,
  BannerTitle
} from "@/components/kibo-ui/banner"

export function SalesProBanner() {
  return (
    <Banner
      inset
      className="bg-background text-foreground border-border border"
    >
      <BannerIcon icon={Crown} className="text-amber-500" />
      <BannerTitle>
        Actualiza a Pro para acceder a todas las funciones de ventas.
      </BannerTitle>
      <BannerAction asChild>
        <Link
          href="/dashboard/settings/billing"
          prefetch={false}
          className="hover:text-foreground"
        >
          Actualizar a Pro
        </Link>
      </BannerAction>
      <BannerClose aria-label="Cerrar aviso" />
    </Banner>
  )
}
