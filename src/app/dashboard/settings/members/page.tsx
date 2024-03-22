import PageSubtitle from "@/components/dashboard/page-subtitle"
import { DataTable } from "@/components/data-table/data-table"
import { columns } from "@/app/dashboard/settings/members/columns"
import { getMembers } from "@/server/actions/user/queries"

export default async function MembersPage() {
  const data = await getMembers()

  return (
    <div className="mx-auto grow px-4 sm:px-6">
      <PageSubtitle
        title="Miembros"
        description="Administra a los miembros de tu equipo"
      />
      <div className="mt-6">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  )
}
