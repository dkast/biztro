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
    title: "Amplía tu alcance digital",
    Icon: BadgeCheck,
    description:
      "Integra tu menú con tus redes sociales y sitio web para aumentar la visibilidad de tu negocio. Los clientes pueden compartir tu menú utilizando una liga directa a tu sitio.",
    soon: false
  },
  {
    title: "Actualiza sin límites",
    Icon: RefreshCcw,
    description:
      "Cambia precios, añade platillos de temporada o actualiza ingredientes en segundos. Responde ágilmente a cambios en costos o disponibilidad sin gastos de impresión.",
    soon: false
  },
  {
    title: "Diferénciate con tu marca",
    Icon: QrCodeIcon,
    description:
      "Destaca frente a la competencia con códigos QR personalizados que reflejan la identidad de tu negocio, aumentando el reconocimiento de marca y la experiencia del cliente.",
    soon: false
  },
  {
    title: "Flexibilidad total",
    Icon: Group,
    description:
      "Crea menús específicos para probar nuevos estilos o lanzar menús de temporada. No tienes que actualizar tu código QR.",
    soon: false
  },
  {
    title: "Marketing integrado",
    Icon: Gem,
    description:
      "Impulsa las ventas destacando promociones especiales o platillos del día, directamente en tu menú digital.",
    soon: true
  },
  {
    title: "Sin compromisos",
    Icon: Handshake,
    description:
      "Modelo flexible que crece con tu negocio. Empieza con lo básico y escala según tus necesidades, sin penalizaciones ni contratos de permanencia.",
    soon: false
  }
]

export default function Benefits() {
  return (
    <section
      id="benefits"
      className="relative bg-gray-50 pb-28 pt-20 dark:bg-transparent sm:py-32"
    >
      <div className="absolute inset-0 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#0a0a0a_40%,#63e_100%)]" />
      <div className="relative z-10">
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
    <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-start">
      <div className="mb-2">
        {Icon && (
          <Icon className="size-10 rounded-xl bg-violet-500 p-2 text-violet-50" />
        )}
      </div>
      <h4 className="space-x-1 text-lg font-semibold text-violet-400">
        {title}
        {soon && (
          <div>
            <Badge variant="violet" className="uppercase tracking-wide">
              Pronto
            </Badge>
          </div>
        )}
      </h4>
      <span className="text-balance text-gray-50">{description}</span>
    </div>
  )
}
