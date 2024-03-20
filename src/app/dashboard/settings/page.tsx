import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import OrganizationForm from "@/app/dashboard/settings/organization-form"
import { getCurrentOrganization } from "@/server/actions/user/queries"

export default async function SettingsPage() {
  const data = await getCurrentOrganization()

  if (!data) {
    return notFound()
  }

  return (
    <div className="mx-auto max-w-2xl grow px-4 sm:px-0">
      <PageSubtitle
        title="Mi Negocio"
        description="Información general del negocio"
      />
      <OrganizationForm data={data} enabled />
    </div>
  )
}
