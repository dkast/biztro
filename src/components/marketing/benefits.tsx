import {
  BadgeCheck,
  Gem,
  Group,
  Handshake,
  QrCodeIcon,
  RefreshCcw,
  type LucideIcon
} from "lucide-react"

import { Badge } from "@/components/ui/badge"

const BENEFITS = [
  {
    title: "Comparte en Redes Sociales",
    Icon: BadgeCheck,
    description:
      "Nuestro diseño optimizado para dispositivos móviles te permite compartir fácilmente el enlace de tu menú en todas tus redes sociales.",
    soon: false
  },
  {
    title: "Menú actualizado",
    Icon: RefreshCcw,
    description:
      "Olvídate de las imágenes o PDFs estáticos. Con Biztro, puedes actualizar tu menú en minutos y mantenerlo siempre al día.",
    soon: false
  },
  {
    title: "Sin contratos",
    Icon: Handshake,
    description:
      "Disfruta de nuestro servicio el tiempo que necesites y cancela en cualquier momento, sin restricciones ni penalizaciones.",
    soon: false
  },
  {
    title: "Ofertas y Promociones",
    Icon: Gem,
    description:
      "Destaca tus promociones directamente en tu menú de forma dinámica y atractiva.",
    soon: true
  },
  {
    title: "Multiples menús",
    Icon: Group,
    description:
      "Crea diferentes menús para probar nuevos estilos o lanzar menús de temporada.",
    soon: false
  },
  {
    title: "Personaliza tu código QR",
    Icon: QrCodeIcon,
    description:
      "Añade tu logo, personaliza los colores y adapta tu código QR para reflejar la imagen de tu negocio.",
    soon: false
  }
]

export default function Benefits() {
  return (
    <section
      id="benefits"
      className="relative mt-16 bg-gray-50 pb-28 pt-20 dark:bg-transparent sm:py-32"
    >
      <div className="absolute inset-0 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      <div className="relative z-10">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <small className="mb-2 text-base font-semibold uppercase tracking-widest text-orange-600">
            Porque Biztro
          </small>
          <h2 className="text-balance font-display text-3xl tracking-tight text-gray-950 dark:text-white sm:text-4xl md:text-5xl">
            Obtén los beneficions de tú menu en digital
          </h2>
        </div>
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
          <Icon className="size-10 rounded-xl bg-purple-500 p-2 text-purple-50" />
        )}
      </div>
      <h4 className="space-x-1 text-lg font-semibold text-purple-400">
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
