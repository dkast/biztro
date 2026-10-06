import { Suspense } from "react"
import { ReceiptText } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { connection } from "next/server"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import {
  SalesTransactionsControlsProvider,
  SalesTransactionsExportButton,
  SalesTransactionsFilterBar
} from "@/components/sales/sales-transactions-controls"
import { SalesTransactionsTable } from "@/components/sales/sales-transactions-table"
import { Skeleton } from "@/components/ui/skeleton"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import { getSalesTransactions } from "@/server/sales/transactions"
import {
  hasActiveSalesTransactionFilters,
  parseSalesTransactionsSearchParams,
  salesTransactionPageSize
} from "@/lib/sales-transactions"

export const metadata: Metadata = {
  title: "Transacciones"
}

function ControlsFallback() {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-hidden>
      <Skeleton className="h-8 w-full sm:w-64" />
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-8 w-28" />
      ))}
    </div>
  )
}

export default async function SalesTransactionsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await connection()

  const [searchParams, organization] = await Promise.all([
    props.searchParams,
    getCurrentOrganization()
  ])

  if (!organization) notFound()

  const searchResult = parseSalesTransactionsSearchParams(searchParams)
  const data = searchResult.valid
    ? await getSalesTransactions({
        organizationId: organization.id,
        filters: searchResult.filters,
        pageSize: salesTransactionPageSize
      })
    : null
  const hasActiveFilters =
    searchResult.valid && hasActiveSalesTransactionFilters(searchResult.filters)

  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6
        sm:py-6"
    >
      <Suspense
        fallback={
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-lg" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <Skeleton className="h-10 w-36" />
            </div>
            <ControlsFallback />
          </div>
        }
      >
        <SalesTransactionsControlsProvider>
          <PageSubtitle className="gap-3 pb-4 sm:items-end sm:gap-4 sm:pb-5">
            <PageSubtitle.Icon icon={ReceiptText} />
            <PageSubtitle.Title>Transacciones</PageSubtitle.Title>
            <PageSubtitle.Description>
              Historial de ventas con filtros y exportación
            </PageSubtitle.Description>
            <PageSubtitle.Actions
              className="w-full sm:mt-0 sm:w-auto sm:flex-none"
            >
              <SalesTransactionsExportButton
                hasTransactions={Boolean(data?.totalCount)}
              />
            </PageSubtitle.Actions>
          </PageSubtitle>

          <SalesTransactionsFilterBar
            validationError={
              searchResult.valid ? undefined : searchResult.error
            }
          />

          {data && (
            <SalesTransactionsTable
              data={data}
              hasActiveFilters={Boolean(hasActiveFilters)}
            />
          )}
        </SalesTransactionsControlsProvider>
      </Suspense>
    </div>
  )
}
