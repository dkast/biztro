import { WalletCards } from "lucide-react"
import { type Metadata } from "next"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { getOrganizationPaymentSettings } from "@/server/actions/organization/queries"
import {
  getCurrentMembershipRole,
  getCurrentOrganization
} from "@/server/actions/user/queries"
import PaymentSettingsForm from "@/app/dashboard/settings/payments/payment-settings-form"
import { MembershipRole } from "@/lib/types/organization"

export const metadata: Metadata = {
  title: "Pagos",
  description: "Configura los métodos de pago y las ventas a crédito"
}

export default async function PaymentSettingsPage() {
  const [organization, role] = await Promise.all([
    getCurrentOrganization(),
    getCurrentMembershipRole()
  ])

  if (!organization) return notFound()

  const settings = await getOrganizationPaymentSettings(organization.id)

  if (!settings) return notFound()

  return (
    <div className="mx-auto w-full max-w-2xl grow px-4 sm:px-0">
      <PageSubtitle>
        <PageSubtitle.Icon icon={WalletCards} />
        <PageSubtitle.Title>Pagos</PageSubtitle.Title>
        <PageSubtitle.Description>
          Define cómo recibe dinero tu negocio
        </PageSubtitle.Description>
      </PageSubtitle>
      <PaymentSettingsForm
        settings={settings}
        canEdit={role === MembershipRole.OWNER}
      />
    </div>
  )
}
