"use client"

import type { Prisma } from "@prisma/client"
import { signIn, useSession } from "next-auth/react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import type { getInviteByToken } from "@/server/actions/user/queries"
import { providers } from "@/lib/types"

// import { acceptInviteSchema } from "@/lib/schemas"
// import { acceptInvite } from "@/server/actions/user/mutations"

export default function AcceptInviteCard({
  invite
}: {
  invite: Prisma.PromiseReturnType<typeof getInviteByToken>
}) {
  const user = useSession().data?.user

  return (
    <Card className="mx-auto max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-balance text-xl">
          {`Hola${user?.name ? ` ${user.name},` : ","} has sido invitado a unirte al equipo de `}
          <span className="text-orange-600">{invite?.organization.name}</span>.
        </CardTitle>
      </CardHeader>
      <CardContent>
        {user ? (
          <div>
            <p>
              Hola {user.name}, has sido invitado a unirte al equipo de{" "}
              <span className="!text-orange-500">
                {invite?.organization.name}
              </span>
              .
            </p>
            <form>
              <div className="mt-4">
                <Button type="submit" className="w-full">
                  Aceptar invitación
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <p>Para aceptar la invitación, por favor inicia sesión.</p>
            <div className="mt-4">
              {Object.values(providers).map(provider => (
                <Button
                  key={provider.name}
                  onClick={() =>
                    signIn(provider.id, {
                      callbackUrl: "/dashboard"
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
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Al aceptar la invitación, aceptas los términos y condiciones.
        </p>
      </CardFooter>
    </Card>
  )
}
