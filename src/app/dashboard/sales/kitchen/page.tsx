import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { connection } from "next/server"

import { KitchenBoard } from "@/components/kitchen/kitchen-board"
import { OrderRealtimeProvider } from "@/components/orders/order-realtime-provider"
import { SalesProBanner } from "@/components/sales/sales-pro-banner"
import { getPaymentSettingsState } from "@/server/actions/payments/queries"
import {
  getCurrentOrganization,
  isProMember
} from "@/server/actions/user/queries"
import {
  getKitchenBoard,
  getKitchenReadyOrders,
  loadOrderSnapshot
} from "@/server/sales/orders"

export const metadata: Metadata = {
  title: "Cocina"
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function KitchenPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await connection()

  const [searchParams, organization, isPro] = await Promise.all([
    props.searchParams,
    getCurrentOrganization(),
    isProMember()
  ])

  if (!organization) notFound()

  const isReadyView = getSingleParam(searchParams.vista) === "listas"
  const readyPageParam = Number.parseInt(
    getSingleParam(searchParams.paginaListas) ?? "1",
    10
  )

  const snapshot = await loadOrderSnapshot("kitchen-snapshot", async () => {
    const [board, readyPage, paymentSettings] = await Promise.all([
      getKitchenBoard(organization.id),
      isReadyView
        ? getKitchenReadyOrders(
            organization.id,
            Number.isFinite(readyPageParam) ? readyPageParam : 1
          )
        : Promise.resolve(null),
      getPaymentSettingsState(organization.id)
    ])

    return {
      board,
      readyPage,
      paymentTiming: paymentSettings?.paymentTiming ?? "PAY_FIRST"
    }
  })

  return (
    <div
      className="flex w-full flex-col gap-3 px-4 py-4 sm:h-[calc(100dvh-4rem)]
        sm:px-6"
    >
      {!isPro && <SalesProBanner />}
      <OrderRealtimeProvider key={organization.id}>
        <KitchenBoard snapshot={snapshot} organizationId={organization.id} />
      </OrderRealtimeProvider>
    </div>
  )
}
