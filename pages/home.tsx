import Head from "next/head"
import Image from "next/image"
import * as Toolbar from "@radix-ui/react-toolbar"
import Link from "next/link"

import type { NextPageWithAuthAndLayout } from "@/lib/types"
import { ArrowSmRightIcon } from "@heroicons/react/outline"

const Home: NextPageWithAuthAndLayout = () => {
  return (
    <>
      <Head>
        <title>Bistro</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen flex-col items-center overflow-auto">
        {/* Menu */}
        <div className="mt-2 flex w-full max-w-6xl items-center py-2 px-2 xl:px-0">
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
        <div className="grid w-full max-w-6xl px-2 sm:grid-cols-2 xl:px-0">
          <div className="py-12 md:py-24">
            <h1 className="text-6xl font-bold">Tu menú digital en minutos</h1>
            <h2 className="py-6 text-2xl text-gray-600 md:py-8">
              Crea tu menú digital y QR, compartelo con tus clientes.
            </h2>
            {/* CTA */}
            <div className="flex justify-center gap-4">
              <Link href="/app/dashboard">
                <a className="flex items-center rounded-lg bg-orange-500 px-4 py-3 text-orange-100 shadow-md shadow-orange-500/50 hover:bg-orange-600">
                  Crea tu menú
                  <ArrowSmRightIcon className="ml-2 h-6 w-6 text-current" />
                </a>
              </Link>
              <Link href="/app/dashboard">
                <a className="rounded-lg border border-orange-500 px-4 py-3 text-orange-600 hover:bg-orange-50">
                  Ver un Ejemplo
                </a>
              </Link>
            </div>
          </div>
          <div className="bg-gray-200"></div>
        </div>
        {/* Main */}
        <div className="flex w-full flex-col justify-center bg-gray-100">
          {/* QR */}
          <section className="mx-auto grid w-full max-w-6xl px-2 md:grid-cols-2 xl:px-0">
            <div className="flex flex-col justify-center p-4">
              <h3 className="text-2xl font-bold">Obtén tu Código QR</h3>
              <p>
                Crea tu menú que permita que tus clientes consultarlo
                rápidamente utilizando simplementa la cámara en su télefono
                móvil.
              </p>
            </div>
            <div>Imagen 1</div>
          </section>
          {/* Online */}
          <section className="mx-auto grid w-full max-w-6xl px-2 md:grid-cols-2 xl:px-0">
            <div className="col-start-1 flex flex-col justify-center p-4 md:col-start-2">
              <h3 className="text-2xl font-bold">No requiere instalación</h3>
              <p>
                Tu menú esta disponible para todos, no se requiere instalar
                alguna app, puede verse desde tú teléfono, tablet o escritorio.
              </p>
            </div>
            <div className="md:order-first">Imagen 2</div>
          </section>
          {/* Customize */}
          <section className="mx-auto grid w-full max-w-6xl px-2 md:grid-cols-2 xl:px-0">
            <div className="flex flex-col justify-center p-4">
              <h3 className="text-2xl font-bold">Diseño flexible</h3>
              <p>
                Inicia con una plantilla moderna, personalizala a tu gusto para
                crear algo original justo como tu negocio.
              </p>
            </div>
            <div>Imagen 3</div>
          </section>
          {/* Social */}
          <section className="mx-auto grid w-full max-w-6xl px-2 md:grid-cols-2 xl:px-0">
            <div className="col-start-1 flex flex-col justify-center p-4 md:col-start-2">
              <h3 className="text-2xl font-bold">Haz cambios al instante</h3>
              <p>
                Con una interfaz de arrastrar y soltar, es fácil cambios a tu
                menú, no requieres habilidades técnicas y los resultados se
                pueden ver al instante.
              </p>
            </div>
            <div className="md:order-first">Imagen 4</div>
          </section>
        </div>
        {/* Banner */}
        <div className="flex w-full flex-col justify-center py-16">
          <div className="mx-auto w-full max-w-5xl px-2 xl:px-0">
            <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-orange-500 to-red-500 p-8 shadow-xl xl:p-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-lg shadow-orange-700/50">
                <Image
                  src="/logo-bistro.svg"
                  alt="Logo"
                  width={40}
                  height={40}
                />
              </div>
              <h3 className="mt-4 mb-12 text-3xl text-white">
                Crea tu menú en Bistro hoy.
              </h3>
              <Link href="/app/dashboard">
                <a className="flex items-center rounded-lg bg-white px-4 py-3 text-orange-500 shadow-md shadow-orange-700/50 hover:bg-gray-50">
                  Crea tú cuenta
                  <ArrowSmRightIcon className="ml-2 h-6 w-6 text-current" />
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

Home.auth = false

export default Home
