import Link from "next/link"

import Footer from "@/components/marketing/footer"
import Navbar from "@/components/marketing/nav-bar"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex h-dvh w-full flex-col">
      <Navbar />
      <div className="flex h-96 grow flex-col items-center justify-center gap-6 sm:gap-12">
        <h1 className="font-display text-6xl font-medium slashed-zero text-gray-800 dark:text-gray-200 sm:text-8xl">
          404
        </h1>
        <div className="space-y-2 text-center text-gray-500">
          <h2 className="text-2xl sm:text-3xl">Página no encontrada</h2>
          <p>No encontramos la página que estas buscando</p>
        </div>
        <Link href="/">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
      <div className="w-full">
        <Footer />
      </div>
    </div>
  )
}
