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
        className="absolute inset-0 h-full w-full items-center px-5 py-24 sm:inset-x-4 sm:w-auto sm:rounded-3xl"
        style={{
          background: `
          radial-gradient(ellipse 120% 80% at 70% 20%, rgba(255, 20, 147, 0.15), transparent 50%),
          radial-gradient(ellipse 100% 60% at 30% 10%, rgba(0, 255, 255, 0.12), transparent 60%),
          radial-gradient(ellipse 90% 70% at 50% 0%, rgba(138, 43, 226, 0.18), transparent 65%),
          radial-gradient(ellipse 110% 50% at 80% 30%, rgba(255, 215, 0, 0.08), transparent 40%),
          #000000
        `
        }}
      />
      <div className="dark relative z-10">
        <TitleSection
          eyebrow="Por qué elegir Biztro"
          title="Transforma la experiencia de tus clientes y aumenta tus ingresos"
        />
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 px-4 sm:grid-cols-3 sm:gap-12 sm:px-6 lg:max-w-7xl lg:gap-16 lg:px-8">
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
          <Icon className="size-10 rounded-xl bg-orange-600 p-2 text-orange-50" />
        )}
      </div>
      <h4 className="space-x-1 text-lg font-semibold text-orange-400">
        {title}
        {soon && (
          <div>
            <Badge variant="violet" className="tracking-wide uppercase">
              Pronto
            </Badge>
          </div>
        )}
      </h4>
      <span className="text-balance text-gray-50">{description}</span>
    </div>
  )
}
