"use client"

import Image from "next/image"

// search params are provided by the page; only read error from window when needed

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { signIn } from "@/lib/auth-client"
import { providers } from "@/lib/types"

export default function LoginForm({
  callbackUrl: propCallbackUrl
}: {
  callbackUrl?: string
} = {}) {
  // prefer the prop provided by the page; default to dashboard
  const callbackUrl = propCallbackUrl ?? "/dashboard"
  // read `error` from the client URL if present (this file is client-side)
  let error: string | null = null
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search)
    error = params.get("error")
  }

  return (
    <div>
      {Object.values(providers).map(provider => (
        <Button
          key={provider.name}
          onClick={() =>
            signIn.social({
              provider: provider.id,
              callbackURL: callbackUrl ? callbackUrl : "/dashboard"
            })
          }
          className="mt-4 w-full shadow-xs"
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
