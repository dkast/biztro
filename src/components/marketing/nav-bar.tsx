import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function Navbar({
  children,
  showLinks = false
}: {
  children?: React.ReactNode
  showLinks?: boolean
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 bg-white/50 dark:bg-black/5">
      <div className="glass"></div>
      <div className="absolute inset-0 mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex flex-row items-center gap-2">
          <Image src="/logo-bistro.svg" alt="Logo" width={32} height={32} />
          <span className="font-medium">Biztro</span>
        </Link>
        {showLinks && (
          <nav className="hidden space-x-6 text-sm md:flex">
            <Link
              href="#how-it-works"
              className="text-gray-600 hover:text-violet-600 dark:text-gray-300 dark:hover:text-violet-400"
            >
              Cómo Funciona
            </Link>
            <Link
              href="#benefits"
              className="text-gray-600 hover:text-violet-600 dark:text-gray-300 dark:hover:text-violet-400"
            >
              Beneficios
            </Link>
            <Link
              href="#pricing"
              className="text-gray-600 hover:text-violet-600 dark:text-gray-300 dark:hover:text-violet-400"
            >
              Precios
            </Link>
          </nav>
        )}
        {children}
        <Link href="/dashboard">
          <Button
            variant="outline"
            size="xs"
            className="rounded-full px-3 shadow-xs"
          >
            Acceder a mi cuenta
          </Button>
        </Link>
      </div>
    </header>
  )
}
