import { Users } from "lucide-react"
import type { Metadata } from "next"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { getMembers, isProMember } from "@/server/actions/user/queries"
import MemberInvite from "@/app/dashboard/settings/members/member-invite"
import MemberTable from "@/app/dashboard/settings/members/member-table"
import { authClient } from "@/lib/auth-client"

export const metadata: Metadata = {
  title: "Miembros"
}

export default async function MembersPage() {
  const [canInviteMember, canDeleteMember, data, isPro] = await Promise.all([
    authClient.organization.hasPermission({
      permissions: { invitation: ["create"] }
    }),
    authClient.organization.hasPermission({
      permissions: { member: ["delete"] }
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

  return (
    <div className="mx-auto grow px-4 sm:px-6">
      <PageSubtitle
        title="Miembros"
        description="Administra a los miembros de tu equipo"
        Icon={Users}
      >
        {canInviteMember && <MemberInvite isPro={isPro} />}
      </PageSubtitle>
      <div className="mt-6">
        <MemberTable data={members} />
      </div>
    </div>
  )
}
