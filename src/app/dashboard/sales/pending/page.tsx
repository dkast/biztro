import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { connection } from "next/server"

import { OrderRealtimeProvider } from "@/components/orders/order-realtime-provider"
import {
  PendingOrdersBoard,
  type PendingOrdersSnapshot
} from "@/components/orders/pending-orders-board"
import { getCustomerOptions } from "@/server/actions/customers/queries"
import { getPaymentSettingsState } from "@/server/actions/payments/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import { getPendingOrders, loadOrderSnapshot } from "@/server/sales/orders"
import type { OrderSnapshotResult } from "@/lib/types/order"

export const metadata: Metadata = {
  title: "Por cobrar"
}

export default async function PendingOrdersPage() {
  await connection()

  const organization = await getCurrentOrganization()
  if (!organization) notFound()

  const result = await loadOrderSnapshot("pending-snapshot", async () => {
    const paymentSettings = await getPaymentSettingsState(organization.id)
    if (!paymentSettings) return null

    const [data, customers] = await Promise.all([
      getPendingOrders(organization.id),
      paymentSettings.creditEnabled
        ? getCustomerOptions(organization.id)
        : Promise.resolve([])
    ])

    return {
      data,
      customers,
      acceptedMethods: paymentSettings.acceptedMethods,
      creditEnabled: paymentSettings.creditEnabled,
      paymentTiming: paymentSettings.paymentTiming
    }
  })
  const snapshot: OrderSnapshotResult<PendingOrdersSnapshot> =
    result.status === "error"
      ? result
      : { status: "success", data: result.data ?? notFound() }

  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6
        sm:py-6"
    >
      <OrderRealtimeProvider key={organization.id}>
        <PendingOrdersBoard
          snapshot={snapshot}
          organizationId={organization.id}
        />
      </OrderRealtimeProvider>
    </div>
  )
}
