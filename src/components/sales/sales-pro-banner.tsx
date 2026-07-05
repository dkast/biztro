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
      className="bg-linear-to-r/oklch from-sky-500 to-indigo-500 text-white"
    >
      <BannerIcon
        icon={Crown}
        className="border-white/20 bg-white/10 text-white"
      />
      <BannerTitle>
        El módulo de ventas requiere el plan Pro. Actualiza para registrar
        ventas y seguir su rendimiento desde el dashboard.
      </BannerTitle>
      <BannerAction
        asChild
        className="border-white/20 bg-white/10 text-white hover:bg-white/20
          hover:text-white"
      >
        <Link href="/dashboard/settings/billing" prefetch={false}>
          Actualizar a Pro
        </Link>
      </BannerAction>
      <BannerClose
        aria-label="Cerrar aviso"
        className="text-white hover:bg-white/20 hover:text-white"
      />
    </Banner>
  )
}
