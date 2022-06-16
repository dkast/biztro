import Head from "next/head"
import Link from "next/link"
import Image from "next/image"
import { ArrowSmRightIcon } from "@heroicons/react/outline"
import { useRouter } from "next/router"

const AuthError = () => {
  const router = useRouter()

  const { error } = router.query

  if (error) {
    return (
      <>
        <Head>
          <title>Bistro - Bienvenido</title>
        </Head>
        <div className="flex min-h-screen bg-white">
          <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
            <div className="mx-auto w-full max-w-sm lg:w-96">
              <div className="flex flex-col gap-4">
                <Image
                  className="h-12 w-12"
                  src="/logo-bistro.svg"
                  alt="Bistro"
                  width={64}
                  height={64}
                />
                <div className="text-center">
                  <h2 className="text-3xl font-semibold leading-9 text-gray-900">
                    Estamos casi listos
                  </h2>
                  <p className="mt-4 text-lg text-gray-500">
                    Actualmente estamos en Beta. Nos encontramos afinando los
                    últimos detalles. Vuelve pronto.
                  </p>
                </div>
                <div className="mt-6 text-center">
                  <Link href="/">
                    <a className="font-semibold text-violet-500 hover:text-violet-700">
                      Volver al inicio
                      <ArrowSmRightIcon className="inline h-6 w-6" />
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="relative hidden w-0 flex-1 lg:block">
            {/* https://images.unsplash.com/photo-1507914372368-b2b085b925a1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1980&q=80 */}
            <Image
              className="absolute inset-0 h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1529514027228-b808875f9d37?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1980&q=80"
              alt="Imagen restaurant"
              layout="fill"
            />
          </div>
        </div>
      </>
    )
  } else {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center">
        <div className="mb-10">
          <Image src="/logo-bistro.svg" alt="Logo" width={80} height={80} />
        </div>
        <h3 className="mb-3 font-bold uppercase text-gray-500">Error</h3>
        <h1 className="mb-2 text-5xl font-bold">Ha ocurrido un error.</h1>
        <p className="text-gray-500">
          No pudimos encontrar la página que esta buscando.
        </p>
        <div className="mt-6">
          <Link href="/">
            <a className="font-semibold text-violet-500 hover:text-violet-700">
              Volver al inicio
              <ArrowSmRightIcon className="inline h-6 w-6" />
            </a>
          </Link>
        </div>
      </div>
    )
  }
}

export default AuthError
