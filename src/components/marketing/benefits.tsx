import {
  BadgeCheck,
  Gem,
  Group,
  HandCoins,
  QrCodeIcon,
  RefreshCcw,
  type LucideIcon
} from "lucide-react"

import { Badge } from "@/components/ui/badge"

const BENEFITS = [
  {
    title: "Comparte en tus Redes Sociales",
    Icon: BadgeCheck,
    description:
      "Diseñado especialmente para dispositivos móviles, puedes compartir la liga a tu menú en tus redes sociales.",
    soon: false
  },
  {
    title: "Menú actualizado",
    Icon: RefreshCcw,
    description:
      "A diferencia de una imagen o un PDF, puedes hacer cambios a tú menú en minutos. Mantén tu menú siempre actualizado.",
    soon: false
  },
  {
    title: "Sin contratos",
    Icon: HandCoins,
    description:
      "Puedes usar el servicio el tiempo que lo necesites y cancelar en cualquier momento, sin restricciones o penalizaciones.",
    soon: false
  },
  {
    title: "Ofertas y Promociones",
    Icon: Gem,
    description:
      "Muestra las promociones directamente en tú menú de forma dinámica y atractiva.",
    soon: true
  },
  {
    title: "Multiples menús",
    Icon: Group,
    description:
      "Crea diferentes menús, prueba otro estilo o menú de temporada.",
    soon: false
  },
  {
    title: "Personaliza tu código QR",
    Icon: QrCodeIcon,
    description:
      "Agrega tu logo, personaliza sus colores y adapta tu código QR para reflejar mejor la imágen de tu negocio.",
    soon: false
  }
]

export default function Benefits() {
  return (
    <section id="benefits" className="mt-16 bg-gray-50 pb-28 pt-20 sm:py-32">
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
          <Icon className="size-10 rounded-xl bg-green-500 p-2 text-green-50" />
        )}
      </div>
      <p className="space-x-1 text-lg font-semibold text-green-900">
        {title}
        {soon && (
          <div>
            <Badge variant="violet" className="uppercase tracking-wide">
              Pronto
            </Badge>
          </div>
        )}
      </p>
      <span className="text-balance text-gray-600">{description}</span>
    </div>
  )
}
