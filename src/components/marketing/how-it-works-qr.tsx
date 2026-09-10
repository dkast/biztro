import { CornerRightUp, Link2, Printer, Smartphone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import QRimage from "../../../public/qr-example.png"

const exampleUrl = "https://la-bella-italia.biztro.co"
const exampleHost = "la-bella-italia.biztro.co"

const channels = [
  {
    Icon: Printer,
    title: "Imprime el código QR",
    description: "Colócalo en mesas, mostrador o escaparate."
  },
  {
    Icon: Link2,
    title: "Comparte el enlace",
    description: "Úsalo en redes sociales, WhatsApp o tu sitio web."
  },
  {
    Icon: Smartphone,
    title: "Sin instalar nada",
    description:
      "Se abre con la cámara del teléfono y se adapta a cualquier pantalla."
  }
]

export function HowItWorksShare() {
  return (
    <div
      className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16"
    >
      {/* Copy + channels */}
      <div>
        <h3
          className="font-display text-2xl font-semibold tracking-tighter
            text-taupe-950 sm:text-3xl dark:text-taupe-50"
        >
          Comparte tu menú con un código QR y un enlace
        </h3>
        <p
          className="mt-4 max-w-lg text-lg leading-relaxed text-balance
            text-taupe-700 dark:text-taupe-300"
        >
          Descarga tu código QR desde el editor en segundos. Tus clientes lo
          escanean con la cámara de su teléfono y el menú se abre al instante.
        </p>
        <ul className="mt-8 flex flex-col gap-5">
          {channels.map(({ Icon, title, description }) => (
            <li key={title} className="flex items-start gap-4">
              <div
                className="flex size-10 shrink-0 items-center justify-center
                  rounded-lg border border-taupe-200 bg-taupe-50
                  dark:border-taupe-700/50 dark:bg-taupe-800/40"
              >
                <Icon className="size-5 text-taupe-700 dark:text-taupe-300" />
              </div>
              <p className="pt-0.5 text-taupe-700 dark:text-taupe-300">
                <span
                  className="font-semibold text-taupe-950 dark:text-taupe-100"
                >
                  {title}.{" "}
                </span>
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* QR scene */}
      <div
        className="relative isolate overflow-hidden rounded-xl bg-taupe-200 px-6
          py-12 ring-1 ring-taupe-300/60 sm:px-10 sm:py-14 dark:bg-taupe-800
          dark:ring-taupe-700"
      >
        {/* Dot grid texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10
            [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]
            opacity-40 dark:opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(var(--color-taupe-400) 1px, transparent 1px)",
            backgroundSize: "18px 18px"
          }}
        />

        {/* Published chip */}
        <div
          className="absolute top-4 left-4 inline-flex items-center gap-2
            rounded-full bg-taupe-50 py-1 pr-3 pl-2 text-xs font-medium
            text-taupe-700 shadow-sm ring-1 ring-taupe-950/5 sm:top-5 sm:left-5
            dark:bg-taupe-900 dark:text-taupe-200 dark:ring-white/10"
        >
          <span className="relative flex size-2">
            <span
              className="absolute inline-flex size-full animate-ping
                rounded-full bg-green-500 opacity-60"
            />
            <span
              className="relative inline-flex size-2 rounded-full bg-green-600"
            />
          </span>
          Menú publicado
        </div>

        {/* Table tent card */}
        <Link
          href={exampleUrl}
          target="_blank"
          rel="noopener noreferrer"
          prefetch={false}
          className="group mx-auto block w-fit rounded-xl outline-none
            focus-visible:ring-2 focus-visible:ring-orange-500/60
            focus-visible:ring-offset-2 focus-visible:ring-offset-taupe-200"
          aria-label="Abrir el menú de ejemplo"
        >
          <div
            className="flex flex-col items-center gap-4 rounded-xl bg-white p-5
              shadow-xl ring-1 shadow-taupe-900/15 ring-taupe-950/5
              transition-transform duration-300 ease-out
              group-hover:-translate-y-1 dark:bg-taupe-950 dark:shadow-black/40
              dark:ring-white/10"
          >
            <Image
              src={QRimage}
              alt="Código QR de ejemplo"
              width={200}
              height={200}
              className="block size-44 rounded-lg sm:size-52"
            />
            <div className="flex flex-col items-center gap-1">
              <span
                className="font-display text-sm font-semibold tracking-tight
                  text-taupe-950 dark:text-taupe-50"
              >
                Escanea para ver el menú
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-md
                  bg-taupe-100 px-2 py-1 text-xs text-taupe-600
                  dark:bg-taupe-800 dark:text-taupe-300"
              >
                <Link2 className="size-3" />
                {exampleHost}
              </span>
            </div>
          </div>
        </Link>

        <p
          className="mt-6 text-center text-sm text-taupe-700
            dark:text-taupe-300"
        >
          Escanea o{" "}
          <Link
            href={exampleUrl}
            target="_blank"
            rel="noopener noreferrer"
            prefetch={false}
            className="inline-flex items-center gap-1 font-medium text-taupe-900
              underline underline-offset-2 hover:text-taupe-950
              dark:text-taupe-100 dark:hover:text-taupe-50"
          >
            abre el ejemplo
            <CornerRightUp className="size-3" />
          </Link>
        </p>
      </div>
    </div>
  )
}
