import type { Metadata } from "next"
import Image from "next/image"

import { getInviteByToken } from "@/server/actions/user/queries"
import AcceptInviteCard from "@/app/(auth)/invite/[id]/accept-invite-card"
import LoginForm from "@/app/(auth)/login/login-form"
import { getCurrentUser } from "@/lib/session"

export const metadata: Metadata = {
  title: "Unirse a equipo"
}

export default async function InvitePage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params

  if (!params.id) {
    return <InviteExpiredOrInvalid />
  }

  const user = await getCurrentUser()

  // If user session exists, fetch the invitation data
  const invite = await getInviteByToken(params.id)

  if (user && invite.error) {
    // console.dir(invite, { depth: null })
    return (
      <InviteExpiredOrInvalid
        title="Invitación inválida"
        description={invite.error}
      />
    )
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      <Image
        src="/logo-bistro.svg"
        alt="Logo"
        width={44}
        height={44}
        className="py-6"
      />
      <div className="mt-0">
        {!user ? (
          <LoginForm callbackUrl={`/invite/${params.id}`} />
        ) : (
          <AcceptInviteCard invite={invite.data} />
        )}
      </div>
    </div>
  )
}

type InviteExpiredOrInvalidProps = {
  title?: string
  description?: string
}

const InviteExpiredOrInvalid = ({
  title = "Invitación ha expirado o no es válida",
  description = "La invitación ha expirado o ya ha sido utilizada."
}: InviteExpiredOrInvalidProps) => {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      <Image
        src="/logo-bistro.svg"
        alt="Logo"
        width={44}
        height={44}
        className="py-10"
      />
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}
