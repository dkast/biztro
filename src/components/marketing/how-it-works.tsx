import type { CSSProperties } from "react"
import { Rocket, ShoppingBag, Store } from "lucide-react"

import Features from "@/components/flare-ui/features-horizontal"
import { HowItWorksShare } from "@/components/marketing/how-it-works-qr"
import TitleSection from "@/components/marketing/title-section"

const data = [
  {
    id: 1,
    title: "Configura tu negocio",
    content:
      "Agrega el nombre de tu negocio, tus horarios y tus redes sociales. Biztro organiza la información por ti.",
    image: "/configuration.png",
    icon: <Store className="size-6" />
  },
  {
    id: 2,
    title: "Agrega tus productos",
    content:
      "Añade tus productos con descripción, precio e imagen para dejar tu menú listo en pocos minutos.",
    image: "/products.png",
    icon: <ShoppingBag className="size-6" />
  },
  {
    id: 3,
    title: "Personaliza y publica",
    content:
      "Ajusta el diseño en el editor, publica tu menú y compártelo con un enlace o un código QR.",
    image: "/editor.png",
    icon: <Rocket className="size-6" />
  }
]

export default function Component() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
      style={{ "--primary": "oklch(64.6% 0.222 41.116)" } as CSSProperties}
    >
      <TitleSection
        align="left"
        eyebrow="Cómo funciona"
        title="Publica tu menú en 3 pasos."
        tagline="Configura tu negocio, agrega tus productos y comparte tu menú. Sin instalaciones ni conocimientos técnicos."
        className="mb-10 sm:mb-14"
      />
      <Features
        collapseDelay={6000}
        data={data}
        linePosition="bottom"
        stepLabel="Paso"
      />

      {/* Divider between the steps and the sharing scene */}
      <div
        className="my-16 flex items-center gap-4 sm:my-24"
        aria-hidden="true"
      >
        <span className="h-px flex-1 bg-taupe-200 dark:bg-taupe-800" />
        <span
          className="text-xs font-semibold tracking-widest text-taupe-500
            uppercase"
        >
          Listo para compartir
        </span>
        <span className="h-px flex-1 bg-taupe-200 dark:bg-taupe-800" />
      </div>

      <HowItWorksShare />
    </section>
  )
}
