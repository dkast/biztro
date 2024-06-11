"use client"

import { QRCode } from "react-qrcode-logo"
import { MousePointerClick, Paintbrush, QrCodeIcon } from "lucide-react"

import { BentoCard, BentoGrid } from "@/components/marketing/bento-grid"
import ShinyButton from "@/components/marketing/shiny-button"

const features = [
  {
    Icon: Paintbrush,
    name: "Diseño personalizado",
    description:
      "Inicia con una plantilla y modifícala a tu gusto para crear algo original que se ajuste a tú negocio.",
    href: undefined,
    cta: "Ver más",
    background: (
      <div className="absolute inset-0 origin-top">
        <img
          src="iphone-hero.png"
          alt="Diseño"
          className="w-full transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_30%,#000_80%)] group-hover:scale-105"
        />
      </div>
    ),
    className:
      "lg:row-start-1 lg:row-end-4 lg:col-start-1 lg:col-end-2 bg-orange-500 text-orange-50"
  },
  {
    Icon: QrCodeIcon,
    name: "Obtén un código QR",
    description:
      "Permite a tus clientes consultar tu menú utilizando la cámara en su télefono móvil.",
    href: undefined,
    cta: "Ver más",
    background: (
      <div className="absolte inset-0 flex origin-top items-center justify-center pt-8 transition-all duration-300 ease-out group-hover:scale-95">
        <div className="overflow-hidden rounded-lg shadow-xl shadow-violet-700">
          <QRCode
            value="https://biztro.co/menu"
            logoImage="/logo-bistro.svg"
            removeQrCodeBehindLogo
            ecLevel="Q"
          />
        </div>
      </div>
    ),
    className:
      "lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-4 bg-violet-600 text-violet-50"
  },
  {
    Icon: MousePointerClick,
    name: "Editor web",
    description:
      "Con una interfaz de arrastrar y soltar, es fácil realizar cambios y los resultados se pueden ver al instante.",
    href: undefined,
    cta: "Ver más",
    background: (
      <div className="absolute right-8 top-4 flex items-start justify-center py-2 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-95">
        <div className="relative flex items-center justify-center">
          <span className="absolute inline-flex h-8 w-16 rounded-full bg-green-500 group-hover:animate-ping"></span>
          <button className="relative inline-flex rounded-full bg-green-500 px-4 py-2 font-medium text-green-50 shadow-lg shadow-green-500/20">
            Publicar
          </button>
        </div>
      </div>
    ),
    className:
      "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2 bg-gray-800 text-gray-50"
  }
]

export default function Features() {
  return (
    <>
      <section className="xl:max-w-nonetext-center max-w-2xl md:mx-auto md:text-center">
        <h2 className="text-balance font-display text-3xl tracking-tight text-gray-950 dark:text-white sm:text-4xl md:text-5xl">
          Publica tú menú en Internet, fácil y rápido
        </h2>
        <p className="mt-6 text-balance text-lg tracking-tight text-gray-400">
          Sin necesidad de conocimientos técnicos, crear tu menú utilizando una
          interfaz intuitiva y amigable, solo necesitas tu navegador web
        </p>
      </section>
      <section className="mx-auto mt-16 max-w-4xl">
        <BentoGrid className="auto-rows-[14rem] sm:grid-cols-2 sm:grid-rows-4">
          {features.map(feature => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </section>
    </>
  )
}
