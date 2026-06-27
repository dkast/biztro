import { ReceiptText } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createLoader, parseAsString } from "nuqs/server"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { SalesClosingReport } from "@/components/sales/sales-closing"
import { SalesClosingDateFilter } from "@/components/sales/sales-closing-date-filter"
import { SalesClosingExportButton } from "@/components/sales/sales-closing-export"
import { getSalesClosingData } from "@/server/actions/sales/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import {
  getSalesClosingDateValue,
  resolveSalesClosingDateValue
} from "@/lib/sales-closing-date"

export const metadata: Metadata = {
  title: "Cierre diario"
}

const loadSalesClosingSearchParams = createLoader({
  date: parseAsString.withDefault(getSalesClosingDateValue())
})

export default async function SalesClosingPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [{ date }, currentOrg] = await Promise.all([
    loadSalesClosingSearchParams(props.searchParams),
    getCurrentOrganization()
  ])

  if (!currentOrg) {
    notFound()
  }

  const selectedDateValue = resolveSalesClosingDateValue(date)
  const data = await getSalesClosingData(currentOrg.id, selectedDateValue)

  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:gap-8
        sm:px-6 sm:py-6"
    >
      <PageSubtitle className="gap-3 pb-4 sm:items-end sm:gap-4 sm:pb-5">
        <PageSubtitle.Icon icon={ReceiptText} />
        <PageSubtitle.Title>Cierre diario</PageSubtitle.Title>
        <PageSubtitle.Description>
          Reporte de fin de jornada para restaurante
        </PageSubtitle.Description>
        <PageSubtitle.Actions className="w-full sm:mt-0 sm:w-auto sm:flex-none">
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <SalesClosingDateFilter selectedDateValue={selectedDateValue} />
            <SalesClosingExportButton
              data={data}
              className="w-full sm:w-auto"
            />
          </div>
        </PageSubtitle.Actions>
      </PageSubtitle>

      <SalesClosingReport data={data} />
    </div>
  )
}
