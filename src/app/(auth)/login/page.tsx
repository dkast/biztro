import { Suspense } from "react"
import { type Metadata } from "next"
// import { getProviders } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"

// import { notFound } from "next/navigation"

// import Logo from "@/components/logo"
import Spinner from "@/components/ui/spinner"
import LoginForm from "@/app/(auth)/login/login-form"

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Iniciar sesión en Biztro"
}

export default async function LoginPage() {
  // const providers = await getProviders()

  // if (!providers) {
  //   return notFound()
  // }

  const providers = {
    google: { id: "google", name: "Google" }
  }

  return (
    <div className="flex min-h-full flex-1">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex flex-col items-center">
            <Link href="/">
              <Image src="/logo-bistro.svg" alt="Logo" width={44} height={44} />
            </Link>
            <h2 className="mt-4 font-display text-3xl font-medium leading-9 tracking-tight text-gray-900 dark:text-gray-400">
              Bienvenido
            </h2>
            <span className="mt-2 block text-sm text-gray-600 dark:text-gray-400">
              Inicia sesión con tu cuenta de Biztro
            </span>
          </div>

          <div className="mt-10">
            <Suspense fallback={<Loading />}>
              <LoginForm providers={providers} />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          // src="https://images.unsplash.com/photo-1421622548261-c45bfe178854?q=80&w=2938&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          src="https://images.unsplash.com/photo-1653084019129-1f2303bb5bc0?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
          fill
        />
      </div>
    </div>
  )
}

const Loading = () => {
  return (
    <div className="flex h-64 grow items-center justify-center">
      <Spinner />
    </div>
  )
}
