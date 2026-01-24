import React, { Suspense } from "react"
import { VercelToolbar } from "@vercel/toolbar/next"
import { type Metadata, type Viewport } from "next"
import { Inter, Sora } from "next/font/google"

import "../../styles/globals.css"
import "../../styles/gradient-blur.css"

import Spinner from "@/components/ui/spinner"
// import { AxiomWebVitals } from "next-axiom"

import Providers from "@/app/providers"

export const metadata: Metadata = {
  metadataBase: new URL("https://biztro.co"),
  title: {
    template: "%s | Biztro",
    default: "Biztro"
  },
  icons: {
    icon: "/favicon.ico"
  },
  appleWebApp: {
    title: "Biztro"
  },
  description: "Crea tu menú digital en minutos"
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  userScalable: false
}

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

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const shouldInjectToolbar = process.env.NODE_ENV === "development"
  return (
    <html
      className={`${inter.variable} ${sora.variable} scroll-smooth antialiased`}
      suppressHydrationWarning
      lang="es-MX"
    >
      {/* <AxiomWebVitals /> */}
      <body className="bg-white text-gray-950 dark:bg-gray-950 dark:text-white">
        <Suspense
          fallback={
            <div className="flex min-h-dvh items-center justify-center">
              <Spinner />
            </div>
          }
        >
          <Providers>
            <div className="flex min-h-dvh flex-col">
              {children}
              {shouldInjectToolbar && <VercelToolbar />}
            </div>
          </Providers>
        </Suspense>
      </body>
    </html>
  )
}
