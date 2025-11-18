import { Users } from "lucide-react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import {
  getCurrentOrganization,
  getMembers,
  isProMember,
  safeHasPermission
} from "@/server/actions/user/queries"
import MemberInvite from "@/app/dashboard/settings/members/member-invite"
import MemberTable from "@/app/dashboard/settings/members/member-table"

export const metadata: Metadata = {
  title: "Miembros"
}

export default async function MembersPage() {
  const [canInviteMember, canDeleteMember, isPro, currentOrg] =
    await Promise.all([
      safeHasPermission({
        headers: await headers(),
        body: { permissions: { invitation: ["create"] } }
      }),
      safeHasPermission({
        headers: await headers(),
        body: { permissions: { member: ["delete"] } }
      }),
      isProMember(),
      getCurrentOrganization()
    ])

  if (!currentOrg) {
    return notFound()
  }

  const data = await getMembers(currentOrg.id)

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
        {canInviteMember?.success && <MemberInvite isPro={isPro} />}
      </PageSubtitle>
      <div className="mt-6">
        <MemberTable
          data={members}
          canDeleteMember={!!canDeleteMember?.success}
        />
      </div>
    </div>
  )
}
