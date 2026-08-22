import { ArrowLeft, UserRound } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { CustomerReceivablesDetailView } from "@/components/receivables/customer-receivables-detail"
import { Button } from "@/components/ui/button"
import { getCustomerReceivablesDetail } from "@/server/actions/customers/queries"
import { getPaymentFeatureState } from "@/server/actions/payments/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"

export const metadata: Metadata = {
  title: "Detalle de cartera"
}

export default async function CustomerReceivablesPage(props: {
  params: Promise<{ customerId: string }>
}) {
  const [{ customerId }, organization] = await Promise.all([
    props.params,
    getCurrentOrganization()
  ])
  if (!organization) notFound()

  const [detail, paymentFeatureState] = await Promise.all([
    getCustomerReceivablesDetail(organization.id, customerId),
    getPaymentFeatureState(organization.id)
  ])
  if (!detail) notFound()
  if (!paymentFeatureState?.hasCreditHistory) notFound()

  return (
    <div
      className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-5 sm:gap-8
        sm:px-6 sm:py-6"
    >
      <PageSubtitle>
        <PageSubtitle.Icon icon={UserRound} />
        <PageSubtitle.Title>{detail.customer.name}</PageSubtitle.Title>
        <PageSubtitle.Description>
          Ventas abiertas, pagos y saldo pendiente
        </PageSubtitle.Description>
        <PageSubtitle.Actions>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/sales/receivables">
              <ArrowLeft data-icon="inline-start" />
              Cartera
            </Link>
          </Button>
        </PageSubtitle.Actions>
      </PageSubtitle>
      <CustomerReceivablesDetailView
        detail={detail}
        acceptedMethods={paymentFeatureState.acceptedMethods}
      />
    </div>
  )
}
