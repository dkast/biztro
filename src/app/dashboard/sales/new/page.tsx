import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { QuickSaleScreen } from "@/components/sales/quick-sale-screen"
import { SalesProBanner } from "@/components/sales/sales-pro-banner"
import { getCustomerOptions } from "@/server/actions/customers/queries"
import { getPaymentFeatureState } from "@/server/actions/payments/queries"
import { getSalesCatalog } from "@/server/actions/sales/queries"
import {
  getCurrentOrganization,
  isProMember
} from "@/server/actions/user/queries"

export const metadata: Metadata = {
  title: "Nueva venta"
}

export default async function NewSalePage() {
  const [currentOrg, isPro] = await Promise.all([
    getCurrentOrganization(),
    isProMember()
  ])

  if (!currentOrg) {
    notFound()
  }

  const paymentFeatureState = await getPaymentFeatureState(currentOrg.id)

  if (!paymentFeatureState) notFound()

  const [catalog, customers] = await Promise.all([
    getSalesCatalog(currentOrg.id),
    paymentFeatureState.creditEnabled
      ? getCustomerOptions(currentOrg.id)
      : Promise.resolve([])
  ])

  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6"
    >
      {!isPro && <SalesProBanner />}
      <QuickSaleScreen
        catalog={catalog}
        isPro={isPro}
        customers={customers}
        acceptedMethods={paymentFeatureState.acceptedMethods}
        creditEnabled={paymentFeatureState.creditEnabled}
      />
    </div>
  )
}
