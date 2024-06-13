import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function Navbar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 bg-white/50 backdrop-blur-lg dark:bg-black/5">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <Image src="/logo-bistro.svg" alt="Logo" width={32} height={32} />
        </Link>
        {children}
        <Link href="/dashboard">
          <Button
            variant="outline"
            size="xs"
            className="rounded-full px-3 shadow-sm"
          >
            Iniciar sesión
          </Button>
        </Link>
      </div>
    </header>
  )
}
