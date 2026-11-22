import { MousePointerClick, QrCodeIcon, SwatchBook } from "lucide-react"
import Image from "next/image"

import { BentoCard, BentoGrid } from "@/components/flare-ui/bento-grid"
import GradientBlur from "@/components/flare-ui/gradient-blur"
import { PublishStage, QrStage } from "@/components/marketing/bento-stages"
import TitleSection from "@/components/marketing/title-section"

const features = [
  {
    Icon: SwatchBook,
    name: "Diseño alineado a tu marca",
    description:
      "Empieza con una plantilla y ajusta colores, imágenes y etiquetas como alérgenos para que tu menú se vea como tu negocio.",
    cta: "Ver diseños",
    background: (
      <div className="absolute inset-0 origin-top">
        <Image
          src="/handheld-menu.png"
          alt="Vista del menú en un celular"
          className="w-full translate-y-[-8%] transition-all duration-300
            ease-out group-hover:scale-105 sm:h-full sm:w-full sm:translate-y-0
            sm:object-contain sm:object-bottom"
          width={600}
          height={600}
        />
        <GradientBlur className="inset-x-0 bottom-0 h-2/3 sm:h-1/3" />
      </div>
    ),
    className:
      "h-[22rem] sm:h-[34rem] lg:h-auto lg:row-start-1 lg:row-end-3 lg:col-start-1 lg:col-end-2 bg-orange-600 dark:bg-orange-600 dark:text-orange-50 text-orange-50"
  },
  {
    Icon: MousePointerClick,
    name: "Editor fácil de usar",
    description:
      "Edita secciones, productos y precios desde un editor visual. No necesitas experiencia técnica para dejar tu menú listo.",
    href: undefined,
    cta: "Ver el editor",
    background: (
      <div className="bento-stage absolute inset-x-0 top-0">
        <PublishStage />
      </div>
    ),
    className:
      "h-[22rem] lg:h-auto lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2 text-taupe-50 bg-taupe-950 dark:bg-taupe-900"
  },
  {
    Icon: QrCodeIcon,
    name: "QR y enlace para compartir",
    description:
      "Tus clientes pueden abrir tu menú desde su teléfono al escanear el código o entrar desde un enlace, sin instalar ninguna app.",
    href: undefined,
    cta: "Ver ejemplo",
    background: (
      <div className="bento-stage absolute inset-x-0 top-0">
        <QrStage />
      </div>
    ),
    className:
      "h-[26rem] lg:h-auto lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-3 bg-taupe-200 dark:bg-taupe-700 dark:text-taupe-50 text-taupe-950"
  }
]

export default function FeaturesBento() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <TitleSection
          eyebrow="Tu menú digital"
          title="Olvídate de los PDFs desactualizados."
          tagline="Edita precios, fotos y categorías desde el navegador, y tus cambios se publican al instante."
          align="left"
        />
      </section>
      <section className="mx-auto mt-10 max-w-6xl px-4 sm:mt-14 sm:px-6 lg:px-8">
        <BentoGrid
          className="biztro-bento auto-rows-auto lg:grid-cols-2
            lg:grid-rows-[18rem_24rem]"
        >
          {features.map(feature => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </section>
    </>
  )
}
