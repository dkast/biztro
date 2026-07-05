import { Banknote } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createLoader, parseAsStringEnum } from "nuqs/server"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { SalesDashboard } from "@/components/sales/sales-dashboard"
import { SalesDashboardPeriodFilter } from "@/components/sales/sales-dashboard-period-filter"
import { SalesProBanner } from "@/components/sales/sales-pro-banner"
import { getSalesDashboardData } from "@/server/actions/sales/queries"
import {
  getCurrentOrganization,
  isProMember
} from "@/server/actions/user/queries"
import {
  defaultSalesDashboardPeriod,
  salesDashboardPeriodValues
} from "@/lib/sales-dashboard-period"

export const metadata: Metadata = {
  title: "Ventas"
}

const loadSalesDashboardSearchParams = createLoader({
  period: parseAsStringEnum([...salesDashboardPeriodValues]).withDefault(
    defaultSalesDashboardPeriod
  )
})

export default async function SalesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [{ period }, currentOrg, isPro] = await Promise.all([
    loadSalesDashboardSearchParams(props.searchParams),
    getCurrentOrganization(),
    isProMember()
  ])

  if (!currentOrg) {
    notFound()
  }

  const data = await getSalesDashboardData(currentOrg.id, period)

  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:gap-8
        sm:px-6 sm:py-6"
    >
      <PageSubtitle className="gap-3 pb-4 sm:items-end sm:gap-4 sm:pb-5">
        <PageSubtitle.Icon icon={Banknote} />
        <PageSubtitle.Title>Ventas</PageSubtitle.Title>
        <PageSubtitle.Description>
          Resumen de ventas y actividad reciente
        </PageSubtitle.Description>
        <PageSubtitle.Actions className="w-full sm:mt-0 sm:w-auto sm:flex-none">
          <SalesDashboardPeriodFilter
            inline
            label="Periodo"
            className="w-full sm:w-auto"
          />
        </PageSubtitle.Actions>
      </PageSubtitle>

      {!isPro && <SalesProBanner />}

      <SalesDashboard data={data} />
    </div>
  )
}
