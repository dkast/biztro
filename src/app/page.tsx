"use cache"

import type { Metadata } from "next"
import { cacheLife } from "next/cache"

import Benefits from "@/components/marketing/benefits"
import FeaturesBento from "@/components/marketing/bento-features"
import CTABanner from "@/components/marketing/cta-banner"
import EditorPreview from "@/components/marketing/editor-preview"
import Faq from "@/components/marketing/faq"
import Footer from "@/components/marketing/footer"
import Hero from "@/components/marketing/hero"
import HowItWorks from "@/components/marketing/how-it-works"
import Navbar from "@/components/marketing/nav-bar"
import Pricing from "@/components/marketing/pricing"

export const metadata: Metadata = {
  title: "Biztro | Crea tu menú digital profesional en minutos",
  description:
    "Diseña, actualiza y comparte menús QR profesionales. Aumenta tus ventas y mejora la experiencia de tus clientes sin conocimientos técnicos.",
  keywords:
    "menu digital, menu QR, restaurante, cafetería, hostelería, menú online"
}

export default async function Page() {
  cacheLife("weeks")
  return (
    <div className="relative dark:bg-gray-950">
      <Navbar showLinks />
      <Hero />
      <EditorPreview />
      <FeaturesBento />
      <HowItWorks />
      <Benefits />
      <Pricing />
      <Faq />
      <CTABanner />
      <Footer />
    </div>
  )
}
