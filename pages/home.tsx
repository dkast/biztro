import Head from "next/head"
import Image from "next/image"
import * as Toolbar from "@radix-ui/react-toolbar"
import Link from "next/link"

import type { NextPageWithAuthAndLayout } from "@/lib/types"

const Home: NextPageWithAuthAndLayout = () => {
  return (
    <>
      <Head>
        <title>Bistro</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen flex-col items-center px-2">
        {/* Menu */}
        <div className="mt-2 flex w-full max-w-6xl items-center bg-gray-100 py-2">
          <Image src="/logo-bistro.svg" alt="Logo" width={40} height={40} />
          <Toolbar.Root className="ml-auto">
            <Toolbar.Button>
              <Link href="/app/dashboard">
                <a className="hover:text-violet-600">Iniciar sesión</a>
              </Link>
            </Toolbar.Button>
          </Toolbar.Root>
        </div>
        {/* Hero */}
        <div className="bg-50 h- grid w-full max-w-6xl sm:grid-cols-2">
          <div className="py-12 md:py-24">
            <h1 className="text-6xl font-bold">Tu menú digital en minutos</h1>
            <h2 className="py-6 text-2xl text-gray-600 md:py-8">
              Crea tu menú digital y QR, compartelo con tus clientes.
            </h2>
            {/* CTA */}
            <div className="flex justify-center gap-4">
              <Link href="/app/dashboard">
                <a className="rounded-lg bg-orange-500 px-4 py-3 text-orange-100 shadow-md shadow-orange-500/50 hover:bg-orange-600">
                  Crea tu menú
                </a>
              </Link>
              <Link href="/app/dashboard">
                <a className="rounded-lg border border-orange-500 px-4 py-3 text-orange-600">
                  Ver un Ejemplo
                </a>
              </Link>
            </div>
          </div>
          <div className="bg-gray-200"></div>
        </div>
        {/* Main */}
        <div className="h-80 w-full bg-gray-100"></div>
      </div>
    </>
  )
}

Home.auth = false

export default Home
