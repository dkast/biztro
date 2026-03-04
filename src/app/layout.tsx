import React, { Suspense } from "react"
import { VercelToolbar } from "@vercel/toolbar/next"
import { Agentation } from "agentation"
import { type Metadata, type Viewport } from "next"
import { Inter, Mona_Sans } from "next/font/google"

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

const monaSans = Mona_Sans({
  subsets: ["latin"],
  variable: "--font-mona-sans",
  display: "swap",
  axes: ["wdth"]
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
      className={`${monaSans.variable} ${inter.variable} overscroll-none
        scroll-smooth antialiased`}
      suppressHydrationWarning
      lang="es-MX"
    >
      {/* <AxiomWebVitals /> */}
      <body
        className="bg-taupe-100 text-taupe-950 dark:bg-taupe-950
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
