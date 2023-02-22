import { ArrowSmRightIcon } from "@heroicons/react/outline"
import Image from "next/image"
import Link from "next/link"

const Custom404 = () => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div className="mb-10">
        <Image src="/logo-bistro.svg" alt="Logo" width={80} height={80} />
      </div>
      <h3 className="mb-3 font-bold uppercase text-gray-500">Error 404</h3>
      <h1 className="mb-2 text-5xl font-bold">Página no existe.</h1>
      <p className="text-gray-500">
        No pudimos encontrar la página que esta buscando.
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className="font-semibold text-violet-500 hover:text-violet-700"
        >
          Volver al inicio
          <ArrowSmRightIcon className="inline h-6 w-6" />
        </Link>
      </div>
    </div>
  )
}

export default Custom404
