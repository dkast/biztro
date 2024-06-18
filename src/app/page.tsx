import type { Metadata } from "next"

import Benefits from "@/components/marketing/benefits"
import { CTABanner } from "@/components/marketing/cta-banner"
import EditorPreview from "@/components/marketing/editor-preview"
import Faq from "@/components/marketing/faq"
import Features from "@/components/marketing/features"
import Footer from "@/components/marketing/footer"
import Hero from "@/components/marketing/hero"
import Navbar from "@/components/marketing/nav-bar"

export const metadata: Metadata = {
  title: "Biztro | Crea tu menú digital en minutos"
}

export default function Page() {
  return (
    <div className="relative dark:bg-black">
      <Navbar />
      <Hero />
      <EditorPreview />
      <Features />
      <Benefits />
      <Faq />
      <CTABanner />
      <Footer />
    </div>
  )
}
