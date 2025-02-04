import { Store } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { Badge } from "@/components/ui/badge"
import {
  getCurrentMembership,
  getCurrentOrganization
} from "@/server/actions/user/queries"
import OrganizationDelete from "@/app/dashboard/settings/organization-delete"
import OrganizationForm from "@/app/dashboard/settings/organization-form"
import { MembershipRole, SubscriptionStatus } from "@/lib/types"

export const metadata: Metadata = {
  title: "Mi Negocio"
}

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const variants: Record<
    SubscriptionStatus,
    { label: string; variant: "green" | "yellow" | "destructive" | "violet" }
  > = {
    [SubscriptionStatus.ACTIVE]: { label: "Activo", variant: "green" },
    [SubscriptionStatus.TRIALING]: {
      label: "Periodo de prueba",
      variant: "violet"
    },
    [SubscriptionStatus.CANCELED]: {
      label: "Cancelado",
      variant: "destructive"
    },
    [SubscriptionStatus.INCOMPLETE]: { label: "Incompleto", variant: "yellow" },
    [SubscriptionStatus.INCOMPLETE_EXPIRED]: {
      label: "Expirado",
      variant: "destructive"
    },
    [SubscriptionStatus.PAST_DUE]: {
      label: "Pago pendiente",
      variant: "yellow"
    },
    [SubscriptionStatus.UNPAID]: { label: "No pagado", variant: "destructive" },
    [SubscriptionStatus.PAUSED]: { label: "Pausado", variant: "yellow" }
  }

  const { label, variant } = variants[status]
  return <Badge variant={variant}>{label}</Badge>
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
      <div className="flex items-center justify-between">
        <PageSubtitle
          title="Mi Negocio"
          description="Información general del negocio"
          Icon={Store}
        />
        <StatusBadge status={currentOrg.status as SubscriptionStatus} />
      </div>
      <OrganizationForm data={currentOrg} enabled />
      {membership?.role === MembershipRole.OWNER && (
        <OrganizationDelete organizationId={currentOrg.id} />
      )}
    </div>
  )
}
