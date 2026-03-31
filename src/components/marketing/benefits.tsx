import type { JSX } from "react"
import {
  BadgeCheck,
  Gem,
  Group,
  Handshake,
  QrCodeIcon,
  RefreshCcw,
  type LucideIcon
} from "lucide-react"

import TitleSection from "@/components/marketing/title-section"
import { Badge } from "@/components/ui/badge"

const BENEFITS = [
  {
    title: "Llega a más clientes",
    Icon: BadgeCheck,
    description:
      "Comparte tu menú por QR o enlace para que tus clientes lo consulten en cualquier momento.",
    soon: false
  },
  {
    title: "Actualiza tu menú fácilmente",
    Icon: RefreshCcw,
    description:
      "Cambia precios, productos o disponibilidad sin reimprimir cartas ni PDFs.",
    soon: false
  },
  {
    title: "Destaca tu negocio",
    Icon: QrCodeIcon,
    description:
      "Personaliza tu código QR y el diseño del menú para que se sientan parte de tu marca.",
    soon: false
  },
  {
    title: "Menú flexible",
    Icon: Group,
    description:
      "Crea menús para temporadas, eventos o promociones y publícalos cuando los necesites.",
    soon: false
  },
  {
    title: "Promociona tu negocio",
    Icon: Gem,
    description:
      "Pronto podrás destacar ofertas y productos clave para impulsar más pedidos.",
    soon: true
  },
  {
    title: "Sin compromisos",
    Icon: Handshake,
    description:
      "Empieza con un plan gratuito y cambia solo cuando tu negocio necesite más.",
    soon: false
  }
]

export default function Benefits() {
  return (
    <section id="benefits" className="relative pt-20 pb-28 sm:py-32">
      <div
        className="absolute inset-0 h-full w-full items-center px-5 py-24"
        style={{
          background: `
          radial-gradient(ellipse 120% 80% at 70% 20%, oklch(92.2% 0.005 34.3 / 0.3), transparent 50%),
          radial-gradient(ellipse 100% 60% at 30% 10%, oklch(86.8% 0.007 39.5 / 0.2), transparent 60%),
          radial-gradient(ellipse 90% 70% at 50% 0%, oklch(71.4% 0.014 41.2 / 0.15), transparent 65%),
          oklch(96% 0.002 17.2)
        `
        }}
      />
      <div className="relative z-10">
        <TitleSection
          align="left"
          eyebrow="Por qué usar Biztro"
          title="Más control para tu negocio, mejor experiencia para tus clientes"
          className="mx-auto mb-8 px-4 sm:mb-12 sm:px-6 lg:mb-16 lg:px-8"
        />
        <div
          className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-8 px-4
            sm:grid-cols-3 sm:gap-12 sm:px-6 lg:gap-16 lg:px-8"
        >
          {BENEFITS.map((benefit, index) => (
            <BenefitItem key={index} {...benefit} />
          ))}
        </div>
      </div>
    </section>
  )
}

const BenefitItem = ({
  Icon,
  title,
  description,
  soon
}: {
  Icon: LucideIcon
  title: string
  description: string
  soon: boolean
}): JSX.Element => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div
          className="flex size-10 items-center justify-center rounded-lg border
            border-taupe-200 bg-taupe-50 dark:border-taupe-700/50
            dark:bg-taupe-800/40"
        >
          <Icon className="size-5 text-taupe-700 dark:text-taupe-300" />
        </div>
        {soon && (
          <Badge
            variant="outline"
            className="border-taupe-200 bg-taupe-100 tracking-wide
              text-taupe-600 uppercase dark:border-taupe-700/50
              dark:bg-taupe-800/20 dark:text-taupe-400"
          >
            Pronto
          </Badge>
        )}
      </div>
      <p className="text-taupe-700 dark:text-taupe-300">
        <span className="font-semibold text-taupe-950 dark:text-taupe-100">
          {title}.{" "}
        </span>
        {description}
      </p>
    </div>
  )
}
