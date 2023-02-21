import { ArrowSmRightIcon } from "@heroicons/react/outline"
import Link from "next/link"

import Footer from "@/components//blog/Footer"
import MainMenu from "@/components/blog/MainMenu"

type LayoutProps = {
  children: React.ReactNode
}
const BlogLayout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-screen flex-col items-center overflow-y-auto overflow-x-hidden">
      <MainMenu variant="light" />
      <div className="w-full grow">
        <div className="prose prose-violet mx-4 max-w-2xl md:mx-auto lg:prose-lg">
          {children}
        </div>
      </div>
      <div className="mx-4 my-16 grid max-w-2xl gap-6 border-y py-16 sm:grid-cols-2 md:mx-auto">
        <div className="flex flex-col gap-4">
          <span className="text-lg font-medium">¿Listo para iniciar?</span>
          <span className="text-gray-500">
            Únete y crea tu menú digital fácil y rápido, sin complicaciones para
            tus clientes.
          </span>
        </div>
        <div className="flex items-center justify-center md:justify-end">
          <Link href="/invite">
            <a className="flex items-center rounded-lg bg-gradient-to-tl from-red-500 to-orange-500 px-4 py-3 text-orange-100 shadow-sm shadow-orange-500/50 transition hover:scale-[98%] hover:bg-orange-600">
              Solicita acceso
              <ArrowSmRightIcon className="ml-2 h-6 w-6 text-current" />
            </a>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default BlogLayout
