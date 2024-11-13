import { Store } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import OrganizationDelete from "@/app/dashboard/settings/organization-delete"
import OrganizationForm from "@/app/dashboard/settings/organization-form"
import {
  getCurrentMembership,
  getCurrentOrganization
} from "@/server/actions/user/queries"
import { MembershipRole } from "@/lib/types"

export const metadata: Metadata = {
  title: "Mi Negocio"
}

export default async function SettingsPage() {
  const [membership, currentOrg] = await Promise.all([
    getCurrentMembership(),
    getCurrentOrganization()
  ])

  if (!currentOrg) {
    return notFound()
  }

  return (
    <div className="mx-auto max-w-2xl grow px-4 sm:px-0">
      <PageSubtitle
        title="Mi Negocio"
        description="Información general del negocio"
        Icon={Store}
      />
      <OrganizationForm data={currentOrg} enabled />
      {membership?.role === MembershipRole.OWNER && (
        <OrganizationDelete organizationId={currentOrg.id} />
      )}
    </div>
  )
}
