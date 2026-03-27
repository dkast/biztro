"use client"

import { QRCode } from "react-qrcode-logo"
import { MousePointerClick, QrCodeIcon, SwatchBook } from "lucide-react"
import Image from "next/image"

import { BentoCard, BentoGrid } from "@/components/flare-ui/bento-grid"
import GradientBlur from "@/components/flare-ui/gradient-blur"
import { Ripple } from "@/components/ui/ripple"

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
            ease-out group-hover:scale-105"
          width={600}
          height={600}
        />
        <GradientBlur className="inset-x-0 bottom-0 h-2/3 sm:h-1/3" />
      </div>
    ),
    className:
      "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3 bg-orange-600 dark:bg-orange-600 dark:text-orange-50 text-orange-50"
  },
  {
    Icon: MousePointerClick,
    name: "Editor fácil de usar",
    description:
      "Edita secciones, productos y precios desde un editor visual. No necesitas experiencia técnica para dejar tu menú listo.",
    href: undefined,
    cta: "Ver el editor",
    background: (
      <div
        className="absolute inset-x-0 top-1/3 flex items-start justify-center
          py-2 transition-all duration-300 ease-out group-hover:-translate-y-1
          group-hover:scale-95 sm:inset-auto sm:top-4 sm:right-8"
      >
        <div className="relative flex items-center justify-center">
          <span
            className="absolute inline-flex h-8 w-22 rounded-full bg-taupe-400
              group-hover:animate-ping"
          ></span>
          <button
            className="relative inline-flex rounded-full bg-green-600 px-4 py-2
              font-medium text-green-50 shadow-lg shadow-green-600/30"
          >
            Publicar menú
          </button>
        </div>
      </div>
    ),
    className:
      "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2 text-taupe-50 bg-taupe-950 dark:bg-taupe-900"
  },
  {
    Icon: QrCodeIcon,
    name: "QR y enlace para compartir",
    description:
      "Tus clientes pueden abrir tu menú desde su teléfono al escanear el código o entrar desde un enlace, sin instalar ninguna app.",
    href: undefined,
    cta: "Ver ejemplo",
    background: (
      <>
        <div
          className="absolute inset-0 -top-30 flex origin-top items-center
            justify-center pt-8 transition-all duration-300 ease-out
            group-hover:scale-95"
        >
          <div
            className="overflow-hidden rounded-lg shadow-xl shadow-taupe-900/50"
          >
            <div className="z-10">
              <QRCode
                value="https://biztro.co"
                logoImage="/logo-bistro.svg"
                removeQrCodeBehindLogo
                ecLevel="Q"
                size={128}
              />
            </div>
          </div>
        </div>
        <Ripple numCircles={3} mainCircleSize={210} className="bottom-1/2" />
      </>
    ),
    className:
      "lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-4 bg-taupe-200 dark:bg-taupe-700 dark:text-taupe-50 text-taupe-950"
  }
]

export default function FeaturesBento() {
  return (
    <>
      <section className="mx-auto mt-0 max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2
          className="font-display max-w-[35ch] text-2xl tracking-tighter
            text-pretty sm:text-3xl md:text-4xl"
        >
          <span className="text-taupe-950 dark:text-taupe-50">
            Olvídate de los PDFs desactualizados.{" "}
          </span>
          <span className="max-w-[30ch] text-taupe-400 dark:text-taupe-500">
            Edita precios, fotos y secciones desde el navegador, y tus cambios
            se verán al instante.
          </span>
        </h2>
      </section>
      <section className="mx-auto mt-8 max-w-6xl px-4 sm:mt-12 sm:px-6 lg:px-8">
        <BentoGrid className="sm:grid-cols-2 sm:grid-rows-3">
          {features.map(feature => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </section>
    </>
  )
}
