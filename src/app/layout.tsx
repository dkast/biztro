import React, { Suspense } from "react"
import { VercelToolbar } from "@vercel/toolbar/next"
import { Agentation } from "agentation"
import { type Metadata, type Viewport } from "next"
import { Be_Vietnam_Pro, Inter } from "next/font/google"

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

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-be-vietnam-pro",
  display: "swap"
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
})

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const shouldInjectToolbar = process.env.NODE_ENV === "development"
  return (
    <html
      className={`${beVietnamPro.variable} ${inter.variable} overscroll-none
        scroll-smooth antialiased`}
      suppressHydrationWarning
      lang="es-MX"
    >
      {/* <AxiomWebVitals /> */}
      <body
        className="bg-taupe-100 text-taupe-950 dark:bg-taupe-950/95
          dark:text-taupe-50"
      >
        <Suspense
          fallback={
            <div className="flex min-h-dvh items-center justify-center">
              <Spinner />
            </div>
          }
        >
          <Providers>
            <div className="flex min-h-dvh flex-col overscroll-auto">
              {children}
              {shouldInjectToolbar && <VercelToolbar />}
              {shouldInjectToolbar && <Agentation />}
            </div>
          </Providers>
        </Suspense>
      </body>
    </html>
  )
}
