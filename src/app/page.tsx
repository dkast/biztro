import type { Metadata } from "next"

import Hero from "@/components/marketing/hero"
import Navbar from "@/components/marketing/nav-bar"

export const metadata: Metadata = {
  title: "Biztro | Crea tu menú digital en minutos"
}

export default function Page() {
  return (
    <div className="relative h-dvh">
      <Navbar />
      <Hero />
      <div className="pointer-events-none absolute inset-0 bottom-1/2 h-full w-full [background-image:linear-gradient(to_top,#A57BE5,transparent_30%)] [filter:blur(120px)]"></div>
    </div>
  )
}
