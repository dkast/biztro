"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"
import { Inter, Sora } from "next/font/google"
import Link from "next/link"

// import Footer from "@/components/marketing/footer"
import Navbar from "@/components/marketing/nav-bar"
import { Button } from "@/components/ui/button"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
})

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora"
})

export default function GlobalError({
  error
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html
      className={`${inter.variable} ${sora.variable} scroll-smooth antialiased`}
      lang="es-MX"
    >
      <body className="bg-white text-gray-950 dark:bg-gray-950 dark:text-white">
        <div className="flex h-dvh w-full flex-col">
          <Navbar />
          <div
            className="flex h-96 grow flex-col items-center justify-center gap-6
              sm:gap-12"
          >
            <h1
              className="font-display text-6xl font-medium text-gray-800
                slashed-zero sm:text-8xl dark:text-gray-200"
            >
              Algo salió mal
            </h1>
            <div className="space-y-2 text-center text-gray-500">
              <h2 className="text-2xl sm:text-3xl">
                Error interno del servidor
              </h2>
              <p>
                Ocurrió un error inesperado. Por favor, intenta nuevamente más
                tarde.
              </p>
            </div>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </div>
          <div className="w-full">{/* <Footer /> */}</div>
        </div>
      </body>
    </html>
  )
}
