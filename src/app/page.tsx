import type { Metadata } from "next"

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
  title: "Biztro | Crea tu menú digital en minutos"
}

export default function Page() {
  return (
    <div className="relative dark:bg-gray-950">
      <Navbar />
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
