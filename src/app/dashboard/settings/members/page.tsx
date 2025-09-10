import { Users } from "lucide-react"
import type { Metadata } from "next"
import { headers } from "next/headers"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { getMembers, isProMember } from "@/server/actions/user/queries"
import MemberInvite from "@/app/dashboard/settings/members/member-invite"
import MemberTable from "@/app/dashboard/settings/members/member-table"
import { auth } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Miembros"
}

export default async function MembersPage() {
  const [canInviteMember, canDeleteMember, data, isPro] = await Promise.all([
    auth.api.hasPermission({
      headers: await headers(),
      body: { permissions: { invitation: ["create"] } }
    }),
    auth.api.hasPermission({
      headers: await headers(),
      body: { permissions: { member: ["delete"] } }
    }),
    getMembers(),
    isProMember()
  ])

  const ROLES = ["member", "admin", "owner"] as const
  type Role = (typeof ROLES)[number]

  function toRole(value: unknown): Role {
    return typeof value === "string" &&
      (ROLES as readonly string[]).includes(value)
      ? (value as Role)
      : "member"
  }

  const members = (Array.isArray(data) ? data : (data?.members ?? [])).map(
    m => ({
      ...m,
      user: { ...m.user, image: m.user.image ?? undefined },
      role: toRole(m.role)
    })
  )

  console.dir(canDeleteMember)
  console.dir(canInviteMember)

  return (
    <div className="mx-auto grow px-4 sm:px-6">
      <PageSubtitle
        title="Miembros"
        description="Administra a los miembros de tu equipo"
        Icon={Users}
      >
        {canInviteMember.success && <MemberInvite isPro={isPro} />}
      </PageSubtitle>
      <div className="mt-6">
        <MemberTable data={members} canDeleteMember={canDeleteMember.success} />
      </div>
    </div>
  )
}
