import Image from "next/image"
import Link from "next/link"

import Footer from "@/components/marketing/footer"
import Navbar from "@/components/marketing/nav-bar"
import Waitlist from "@/components/marketing/waitlist"
import { Button } from "@/components/ui/button"

export default async function Page(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  let typeError: string | undefined

  const rawError = searchParams.type ?? searchParams.error

  if (Array.isArray(rawError)) {
    typeError = rawError[0]
  } else if (typeof rawError === "string") {
    typeError = rawError
  }

  if (typeError === "access_denied") {
    return (
      <div className="flex h-dvh">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="flex flex-col items-center justify-center gap-8">
              <Image
                className="h-12 w-12"
                src="/logo-bistro.svg"
                alt="Biztro"
                width={64}
                height={64}
                unoptimized
              />
              <div className="text-center">
                <h2 className="font-display text-3xl leading-9 font-medium">
                  Estamos casi listos
                </h2>
                <p className="mt-4 text-balance text-gray-500 dark:text-gray-400">
                  Actualmente estamos en Beta. Nos encontramos afinando los
                  últimos detalles.
                </p>
                <div className="my-8">
                  <Waitlist />
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link href="/">
                  <Button>Volver al inicio</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          {/* https://images.unsplash.com/photo-1507914372368-b2b085b925a1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1980&q=80 */}
          <Image
            className="absolute inset-0 h-full w-full object-cover"
            priority
            src="https://images.unsplash.com/photo-1529514027228-b808875f9d37?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1980&q=80"
            alt="Imagen restaurant"
            fill
            unoptimized
          />
        </div>
      </div>
    )
  } else {
    return (
      <div className="flex h-dvh w-full flex-col">
        <Navbar />
        <div className="flex h-96 grow flex-col items-center justify-center gap-6 sm:gap-12">
          <h1 className="font-display text-6xl font-medium text-gray-800 slashed-zero sm:text-8xl dark:text-gray-200">
            Oh no...
          </h1>
          <div className="space-y-2 text-center text-gray-500">
            <h2 className="text-2xl sm:text-3xl">Ha ocurrido un error</h2>
            <p>
              Una disculpa, algo salió mal, te sugerimos intentarlo más tarde.
            </p>
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
}
