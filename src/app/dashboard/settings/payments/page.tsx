import { Suspense } from "react"
import { WalletCards } from "lucide-react"
import { type Metadata } from "next"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
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

export default function PaymentSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl grow px-4 sm:px-6 md:px-0">
      <PageSubtitle>
        <PageSubtitle.Icon icon={WalletCards} />
        <PageSubtitle.Title>Pagos</PageSubtitle.Title>
        <PageSubtitle.Description>
          Define cómo recibe dinero tu negocio
        </PageSubtitle.Description>
      </PageSubtitle>
      <Suspense fallback={<PaymentSettingsSkeleton />}>
        <PaymentSettingsContent />
      </Suspense>
    </div>
  )
}

async function PaymentSettingsContent() {
  const [organization, role] = await Promise.all([
    getCurrentOrganization(),
    getCurrentMembershipRole()
  ])

  if (!organization) return notFound()

  const settings = await getOrganizationPaymentSettings(organization.id)

  if (!settings) return notFound()

  return (
    <PaymentSettingsForm
      settings={settings}
      canEdit={role === MembershipRole.OWNER}
    />
  )
}

function PaymentSettingsSkeleton() {
  return (
    <div
      className="mt-10 flex flex-col gap-10 px-4 sm:px-6 md:px-0"
      aria-hidden="true"
    >
      <div className="flex flex-col gap-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-3 h-4 w-4/5" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="size-5 rounded-sm" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-8 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
      </div>
      <Separator />
      <div className="flex flex-col gap-6">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="mt-3 h-4 w-4/5" />
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-4 w-full" />
          </div>
          <Skeleton className="h-6 w-11 rounded-full" />
        </div>
        <Separator />
        <div className="flex justify-between gap-4 pt-6">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  )
}
