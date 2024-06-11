import type { Metadata } from "next"

import EditorPreview from "@/components/marketing/editor-preview"
import Features from "@/components/marketing/features"
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
    </div>
  )
}
