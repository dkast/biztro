import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { connection } from "next/server"

import { PendingOrdersBoard } from "@/components/orders/pending-orders-board"
import { getCustomerOptions } from "@/server/actions/customers/queries"
import { getPaymentFeatureState } from "@/server/actions/payments/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import { getPendingOrders } from "@/server/sales/orders"

export const metadata: Metadata = {
  title: "Por cobrar"
}

export default async function PendingOrdersPage() {
  await connection()

  const organization = await getCurrentOrganization()
  if (!organization) notFound()

  const paymentFeatureState = await getPaymentFeatureState(organization.id)
  if (!paymentFeatureState) notFound()

  const [data, customers] = await Promise.all([
    getPendingOrders(organization.id),
    paymentFeatureState.creditEnabled
      ? getCustomerOptions(organization.id)
      : Promise.resolve([])
  ])

  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6
        sm:py-6"
    >
      <PendingOrdersBoard
        data={data}
        customers={customers}
        acceptedMethods={paymentFeatureState.acceptedMethods}
        creditEnabled={paymentFeatureState.creditEnabled}
        paymentTiming={paymentFeatureState.paymentTiming}
      />
    </div>
  )
}
