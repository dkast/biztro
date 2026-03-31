"use cache"

import type { Metadata } from "next"
import { cacheLife } from "next/cache"

import AIFeatures from "@/components/marketing/ai-features"
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
  title: "Biztro | Crea y publica tu menú digital en minutos",
  description:
    "Crea un menú QR profesional para tu restaurante o cafetería, actualízalo cuando quieras y compártelo sin depender de PDFs ni conocimientos técnicos.",
  keywords:
    "menú digital, menú QR, restaurante, cafetería, carta digital, menú online"
}

// skipcq: JS-0116
export default async function Page() {
  cacheLife("weeks")
  return (
    <div className="relative bg-taupe-100 dark:bg-taupe-950">
      <Navbar showLinks />
      <Hero />
      <EditorPreview />
      <FeaturesBento />
      <HowItWorks />
      <Benefits />
      <AIFeatures />
      <Pricing />
      <Faq />
      <CTABanner />
      <Footer />
    </div>
  )
}
