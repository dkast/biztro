"use client"

import { signIn } from "next-auth/react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function LoginForm({
  providers
}: {
  providers: Record<string, { id: string; name: string }>
}) {
  const searchParams = useSearchParams()
  const error = searchParams?.get("error")
  const callbackUrl = searchParams?.get("callbackUrl")

  return (
    <div>
      {Object.values(providers).map(provider => (
        <Button
          key={provider.name}
          onClick={() =>
            signIn(provider.id, {
              callbackUrl: callbackUrl ? callbackUrl : "/home"
            })
          }
          className="mt-4 w-full shadow-sm"
          variant="outline"
        >
          <Image
            src={`/${provider.name.toLowerCase()}.svg`}
            alt=""
            aria-hidden="true"
            width={24}
            height={24}
            className="mr-2"
            unoptimized
          />
          Continuar con {provider.name}
        </Button>
      ))}
      {error && (
        <div className="mt-8">
          <Alert variant="destructive">
            <AlertDescription>
              Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo
              más tarde.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}
