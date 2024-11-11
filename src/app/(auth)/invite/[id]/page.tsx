import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import AcceptInviteCard from "@/app/(auth)/invite/[id]/accept-invite-card"
import { getInviteByToken } from "@/server/actions/user/queries"
import { InviteStatus } from "@/lib/types"

export const metadata: Metadata = {
  title: "Unirse a equipo"
}

export default async function InvitePage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  if (!params.id) {
    return notFound()
  }

  const data = await getInviteByToken(params.id)

  if (!data) {
    return notFound()
  }

  if (data.expiresAt < new Date() || data.status === InviteStatus.ACCEPTED) {
    return <InviteExpired />
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
        <AcceptInviteCard invite={data} />
      </div>
    </div>
  )
}

const InviteExpired = () => {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      <Image
        src="/logo-bistro.svg"
        alt="Logo"
        width={44}
        height={44}
        className="py-10"
      />
      <h1 className="font-display text-3xl font-semibold">
        Invitación ha expirado
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        La invitación ha expirado o ya ha sido utilizada.
      </p>
    </div>
  )
}
