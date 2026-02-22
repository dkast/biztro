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
    description: "Comparte tu menú en línea y refuerza tu presencia digital.",
    soon: false
  },
  {
    title: "Actualiza tu menú fácilmente",
    Icon: RefreshCcw,
    description:
      "Cambia precios y agrega platillos en segundos sin complicaciones.",
    soon: false
  },
  {
    title: "Destaca tu negocio",
    Icon: QrCodeIcon,
    description: "Usa códigos QR personalizados que muestran tu estilo único.",
    soon: false
  },
  {
    title: "Menú flexible",
    Icon: Group,
    description:
      "Crea menús especiales para eventos o promociones sin esfuerzo.",
    soon: false
  },
  {
    title: "Promociona tu negocio",
    Icon: Gem,
    description:
      "Resalta ofertas y platillos destacados para atraer más clientes.",
    soon: true
  },
  {
    title: "Sin compromisos",
    Icon: Handshake,
    description:
      "Empieza sin contratos largos y adapta tu menú a tus necesidades.",
    soon: false
  }
]

export default function Benefits() {
  return (
    <section id="benefits" className="relative pt-20 pb-28 sm:py-32">
      <div
        className="absolute inset-0 h-full w-full items-center px-5 py-24
          sm:inset-x-4 sm:w-auto sm:rounded-3xl"
        style={{
          background: `
          radial-gradient(ellipse 120% 80% at 70% 20%, rgba(254, 215, 170, 0.3), transparent 50%),
          radial-gradient(ellipse 100% 60% at 30% 10%, rgba(253, 186, 116, 0.2), transparent 60%),
          radial-gradient(ellipse 90% 70% at 50% 0%, rgba(251, 146, 60, 0.15), transparent 65%),
          radial-gradient(ellipse 110% 50% at 80% 30%, rgba(254, 240, 138, 0.2), transparent 40%),
          #fffdfa
        `
        }}
      />
      <div className="relative z-10">
        <TitleSection
          eyebrow="Por qué elegir Biztro"
          title="Transforma la experiencia de tus clientes y aumenta tus ingresos"
        />
        <div
          className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 px-4
            sm:grid-cols-3 sm:gap-12 sm:px-6 lg:max-w-7xl lg:gap-16 lg:px-8"
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
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="mb-2">
        {Icon && (
          <Icon
            className="size-10 rounded-xl bg-orange-100 p-2 text-orange-600
              dark:bg-orange-900/50 dark:text-orange-400"
          />
        )}
      </div>
      <h4
        className="space-x-1 text-lg font-semibold text-orange-950
          dark:text-orange-400"
      >
        {title}
        {soon && (
          <div>
            <Badge
              variant="outline"
              className="border-orange-200 bg-orange-50 tracking-wide
                text-orange-600 uppercase dark:border-orange-900/50
                dark:bg-orange-900/20 dark:text-orange-400"
            >
              Pronto
            </Badge>
          </div>
        )}
      </h4>
      <span className="text-balance text-orange-950/70 dark:text-gray-50">
        {description}
      </span>
    </div>
  )
}
