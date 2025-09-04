"use client"

import toast from "react-hot-toast"
import type { Prisma } from "@prisma/client"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { acceptInvite } from "@/server/actions/user/mutations"
import type { getInviteByToken } from "@/server/actions/user/queries"
import { authClient } from "@/lib/auth-client"
import { getInitials } from "@/lib/utils"

export default function AcceptInviteCard({
  invite
}: {
  invite: Prisma.PromiseReturnType<typeof getInviteByToken>
}) {
  const { data: session } = authClient.useSession()
  const router = useRouter()

  const { execute, status } = useAction(acceptInvite, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
        console.error(data.failure.reason)
        toast.error("Falló la aceptación de la invitación")
      } else if (data?.success) {
        router.push("/dashboard")
      }
    }
  })

  const handleAccept = async (id: string) => {
    await execute({ id })
  }

  if (!invite) {
    return null
  }

  return (
    <Card className="mx-auto max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-pretty">
          {`Hola${session?.user.name ? ` ${session.user.name},` : ","} has sido invitado a unirte al equipo de `}
          <span className="text-orange-600">{invite?.organizationName}</span>.
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <div className="flex w-full flex-col items-center justify-center gap-8 py-2">
            <div className="flex items-center space-x-4">
              <Avatar className="size-6">
                <AvatarImage
                  src={session?.user.image ?? undefined}
                  alt="Avatar"
                />
                <AvatarFallback className="text-xs">
                  {getInitials(session?.user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                Firmado con {session?.user.email}
              </span>
            </div>
            <p className="text-sm">
              Da clic en el botón de abajo para aceptar la invitación.
            </p>
          </div>
          <form>
            <div className="mt-4">
              <Button
                type="button"
                className="w-full"
                onClick={() => handleAccept(invite?.id)}
              >
                Aceptar invitación
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Al aceptar la invitación, aceptas los términos y condiciones.
        </p>
      </CardFooter>
    </Card>
  )
}
