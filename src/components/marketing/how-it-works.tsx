import { CornerRightUp, Rocket, ShoppingBag, Store } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import Features from "@/components/flare-ui/features-horizontal"
import TitleSection from "@/components/marketing/title-section"
import QRimage from "../../../public/qr-example.png"

const data = [
  {
    id: 1,
    title: "1. Configura tu negocio",
    content:
      "Agrega el nombre de tu negocio, tus horarios y tus redes sociales. Biztro organiza la información por ti.",
    image: "/configuration.png",
    icon: <Store className="size-6" />
  },
  {
    id: 2,
    title: "2. Agrega tus productos",
    content:
      "Añade tus productos con descripción, precio e imagen para dejar tu menú listo en pocos minutos.",
    image: "/products.png",
    icon: <ShoppingBag className="size-6" />
  },
  {
    id: 3,
    title: "3. Personaliza y publica",
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
      className="mx-auto max-w-5xl px-4 pt-20 pb-8 sm:px-6 sm:py-32 sm:pb-28
        lg:max-w-7xl lg:px-8"
      style={
        { "--primary": "oklch(64.6% 0.222 41.116)" } as React.CSSProperties
      }
    >
      <TitleSection
        eyebrow="Cómo funciona"
        title="Publica tu menú en 3 pasos"
        className="mb-16"
      />
      <Features collapseDelay={6000} data={data} linePosition="bottom" />
      <div
        className="mx-auto mt-0 grid max-w-5xl grid-cols-1 gap-8 px-4 sm:mt-28
          sm:grid-cols-2 sm:px-0"
      >
        <div>
          <h3
            className="mb-4 text-lg font-semibold text-taupe-950 sm:text-2xl
              lg:text-3xl dark:text-taupe-50"
          >
            Comparte tu menú con un código QR y un enlace
          </h3>
          <div
            className="flex flex-col gap-3 text-taupe-700 sm:text-lg
              dark:text-taupe-300"
          >
            <p>
              Descarga tu código QR desde el editor en segundos. Después puedes
              imprimirlo y colocarlo en mesas, mostrador o escaparate.
            </p>
            <p>
              Tus clientes solo tienen que escanearlo con la cámara de su
              teléfono para abrir tu menú al instante.{" "}
              <span className="text-taupe-950 dark:text-taupe-50">
                También puedes compartir el mismo enlace en redes sociales
              </span>{" "}
              o en tu sitio web.
            </p>
            <p>
              El menú se adapta a celulares y tablets, se lee con claridad y no
              requiere instalar ninguna app.
            </p>
          </div>
        </div>
        <div
          className="relative flex flex-col items-center justify-center gap-3
            overflow-hidden"
        >
          <div
            className="absolute inset-0 z-0 hidden sm:block"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 50% 50%, oklch(71.4% 0.014 41.2 / 0.25), transparent 70%)"
            }}
          />
          <Link
            href="https://la-bella-italia.biztro.co"
            target="_blank"
            rel="noopener noreferrer"
            className="z-10"
          >
            <Image
              src={QRimage}
              alt="Código QR de ejemplo"
              className="rounded-lg shadow-xl"
              width={300}
              height={300}
            />
          </Link>
          <span
            className="z-10 flex items-center gap-2 text-sm text-taupe-700
              dark:text-taupe-300"
          >
            Escanea o{" "}
            <Link
              href="https://la-bella-italia.biztro.co"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-taupe-600 underline
                underline-offset-2 hover:text-taupe-500 dark:text-taupe-400"
            >
              abre el ejemplo
              <CornerRightUp className="size-3" />
            </Link>
          </span>
        </div>
      </div>
    </section>
  )
}
