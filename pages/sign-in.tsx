import React from "react"
import Head from "next/head"
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType
} from "next"
import { getProviders, signIn } from "next-auth/react"
import Image from "next/image"
import { getServerSession } from "next-auth"

import Button from "@/components/Button"
import { authOptions } from "@/lib/auth"

const SignIn = ({
  providers
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
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
                src="/icon.svg"
                alt="Bistro"
                width={64}
                height={64}
              />
              <div className="text-center">
                <h2 className="text-3xl font-semibold leading-9 text-gray-900">
                  Bienvenido
                </h2>
                <span className="text-gray-500">
                  Ingresa a tu cuenta de Bistro
                </span>
              </div>
              <div className="mt-6">
                {Object.values(providers).map(provider => (
                  <div key={provider.name} onClick={() => signIn(provider.id)}>
                    <Button
                      variant="secondary"
                      mode="full"
                      leftIcon={
                        <img
                          src={`/${provider.name.toLowerCase()}.svg`}
                          alt="Google"
                        />
                      }
                    >
                      Continuar con {provider.name}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          {/* https://images.unsplash.com/photo-1507914372368-b2b085b925a1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1980&q=80 */}
          <Image
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1507914372368-b2b085b925a1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1980&q=80"
            alt="Imagen restaurant"
            layout="fill"
          />
        </div>
      </div>
    </>
  )
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { callbackUrl } = context.query
  const providers = await getProviders()
  const session = await getServerSession(context, authOptions)

  if (session?.user) {
    return {
      redirect: {
        permanent: false,
        destination: callbackUrl
      },
      props: { providers }
    }
  }

  return {
    props: { providers }
  }
}

export default SignIn
