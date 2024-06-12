import type { Metadata } from "next"
import Image from "next/image"

import Benefits from "@/components/marketing/benefits"
import EditorPreview from "@/components/marketing/editor-preview"
import Faq from "@/components/marketing/faq"
import Features from "@/components/marketing/features"
import Footer from "@/components/marketing/footer"
import Hero from "@/components/marketing/hero"
import Navbar from "@/components/marketing/nav-bar"
import Waitlist from "@/components/marketing/waitlist"

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

function CTABanner() {
  return (
    <div className="flex w-full flex-col justify-center pb-16 lg:pb-32">
      <div className="mx-auto w-full max-w-5xl px-4 lg:max-w-7xl lg:px-2 xl:px-0">
        <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-orange-500 to-red-500 p-8 shadow-xl shadow-orange-500/30 xl:p-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-lg shadow-orange-700/50">
            <Image
              src="/logo-bistro.svg"
              alt="Logo"
              width={40}
              height={40}
              unoptimized
            />
          </div>
          <p className="mb-1 mt-4 text-lg text-orange-200">
            Inicia con una cuenta gratis
          </p>
          <h3 className="mb-4 text-center text-3xl text-white">
            Crea tu menú en Biztro hoy
          </h3>
          <span className="mb-4 text-orange-200">
            Unirse a la lista de espera
          </span>
          <Waitlist />
        </div>
      </div>
    </div>
  )
}
