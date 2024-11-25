import { Users } from "lucide-react"
import type { Metadata } from "next"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import MemberInvite from "@/app/dashboard/settings/members/member-invite"
import MemberTable from "@/app/dashboard/settings/members/member-table"
import {
  getCurrentMembership,
  getMembers,
  isProMember
} from "@/server/actions/user/queries"
import { MembershipRole } from "@/lib/types"

export const metadata: Metadata = {
  title: "Miembros"
}

export default async function MembersPage() {
  const [membership, data, isPro] = await Promise.all([
    getCurrentMembership(),
    getMembers(),
    isProMember()
  ])

  return (
    <div className="mx-auto grow px-4 sm:px-6">
      <PageSubtitle
        title="Miembros"
        description="Administra a los miembros de tu equipo"
        Icon={Users}
      >
        {membership?.role !== MembershipRole.MEMBER && (
          <MemberInvite isPro={isPro} />
        )}
      </PageSubtitle>
      <div className="mt-6">
        <MemberTable data={data} />
      </div>
    </div>
  )
}
