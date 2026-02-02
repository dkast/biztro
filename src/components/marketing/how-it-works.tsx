import { CornerRightUp, Rocket, ShoppingBag, Store } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import Features from "@/components/flare-ui/features-horizontal"
import FlickeringGrid from "@/components/flare-ui/flickering-grid"
import TitleSection from "@/components/marketing/title-section"
import QRimage from "../../../public/qr-example.png"

const data = [
  {
    id: 1,
    title: "1. Configura tu negocio",
    content:
      "Agregar la información del negocio, tus horarios de atención y redes sociales. Nuestro sistema se encargará de todo lo demás.",
    image: "/configuration.png",
    icon: <Store className="size-6" />
  },
  {
    id: 2,
    title: "2. Lista tus productos",
    content:
      "Captura tus productos, agrega una breve descripción, precio y estarás listo para crear tu menú.",
    image: "/products.png",
    icon: <ShoppingBag className="size-6" />
  },
  {
    id: 3,
    title: "3. Lanza tu menú",
    content:
      "Personaliza tu menú con el editor web, publicalo y comparte el enlace y código QR con tus clientes. ¡Así de fácil!",
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
    >
      <TitleSection
        eyebrow="Cómo funciona"
        title="Solo 3 pasos para iniciar"
        className="mb-16"
      />
      <Features collapseDelay={6000} data={data} linePosition="bottom" />
      <div
        className="mx-auto mt-0 grid max-w-5xl grid-cols-1 gap-8 px-4 sm:mt-28
          sm:grid-cols-2 sm:px-0"
      >
        <div>
          <h3 className="mb-4 text-lg font-semibold sm:text-2xl lg:text-3xl">
            Genera y descarga tú código QR
          </h3>
          <div className="flex flex-col gap-3 text-gray-500 sm:text-lg">
            <p>
              Desde el editor de Biztro, puedes descarga tú código QR. Imprímelo
              y colócalo en un lugar visible en tú establecimiento.
            </p>
            <p>
              Tus clientes podrán escanear el código QR con su teléfono móvil y
              acceder a tu menú digital.{" "}
              <span className="text-gray-900">
                Puedes compartir el enlace de tu menú en redes sociales
              </span>{" "}
              o en tu página web.
            </p>
            <p>
              Los menús digitales de Biztro son responsivos y se adaptan a
              cualquier dispositivo móvil. Son fáciles de leer y navegar, y no
              necesitas instalar ninguna aplicación adicional.
            </p>
          </div>
        </div>
        <div
          className="relative flex flex-col items-center justify-center gap-3
            overflow-hidden"
        >
          <FlickeringGrid
            className="absolute inset-0 z-0 hidden size-full sm:block"
            squareSize={4}
            gridGap={6}
            color="#d4d4d8"
            maxOpacity={0.5}
            flickerChance={0.05}
            height={500}
            width={500}
          />
          <Link
            href="https://biztro.co/la-bella-italia"
            target="_blank"
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
          <span className="z-10 flex gap-2 text-gray-600 text-shadow-white">
            Escanea para ver un{" "}
            <Link
              href="https://biztro.co/la-bella-italia"
              target="_blank"
              className="underline underline-offset-2 hover:text-violet-500"
            >
              ejemplo
            </Link>
            <CornerRightUp className="size-4" />
          </span>
        </div>
      </div>
    </section>
  )
}
