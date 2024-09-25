import { type Metadata, type Viewport } from "next"
import { Inter, Sora } from "next/font/google"

import "../../styles/globals.css"
import "../../styles/gradient-blur.css"

// import { SpeedInsights } from "@vercel/speed-insights/next"
import { AxiomWebVitals } from "next-axiom"

// import "react-photo-view/dist/react-photo-view.css"

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
  return (
    <html
      className={`${inter.variable} ${sora.variable} scroll-smooth antialiased`}
      suppressHydrationWarning
      lang="es-MX"
    >
      <AxiomWebVitals />
      <body className="bg-white text-gray-950 antialiased dark:bg-gray-950 dark:text-white">
        <Providers>
          <div className="flex min-h-dvh flex-col">{children}</div>
        </Providers>
        {/* <SpeedInsights /> */}
      </body>
    </html>
  )
}
