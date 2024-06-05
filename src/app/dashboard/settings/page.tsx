import { Building } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import OrganizationForm from "@/app/dashboard/settings/organization-form"
import { getCurrentOrganization } from "@/server/actions/user/queries"

export const metadata: Metadata = {
  title: "Mi Negocio"
}

export default async function SettingsPage() {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    return notFound()
  }

  return (
    <div className="mx-auto max-w-2xl grow px-4 sm:px-0">
      <PageSubtitle
        title="Mi Negocio"
        description="Información general del negocio"
        Icon={Building}
      />
      <OrganizationForm data={currentOrg} enabled />
    </div>
  )
}
