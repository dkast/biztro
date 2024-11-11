import { Users } from "lucide-react"
import type { Metadata } from "next"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { DataTable } from "@/components/data-table/data-table"
import { columns } from "@/app/dashboard/settings/members/columns"
import MemberInvite from "@/app/dashboard/settings/members/member-invite"
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
  const membership = await getCurrentMembership()
  const data = await getMembers()
  const isPro = await isProMember()

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
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  )
}
