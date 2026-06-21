import { ArrowLeft, ReceiptText } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { SalesClosingReport } from "@/components/sales/sales-closing"
import { SalesClosingExportButton } from "@/components/sales/sales-closing-export"
import { Button } from "@/components/ui/button"
import { getSalesClosingData } from "@/server/actions/sales/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"

export const metadata: Metadata = {
  title: "Cierre diario"
}

export default async function SalesClosingPage() {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    notFound()
  }

  const data = await getSalesClosingData(currentOrg.id)

  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6"
    >
      <PageSubtitle>
        <PageSubtitle.Icon icon={ReceiptText} />
        <PageSubtitle.Title>Cierre diario</PageSubtitle.Title>
        <PageSubtitle.Description>
          Reporte de fin de jornada para restaurante
        </PageSubtitle.Description>
        <PageSubtitle.Actions>
          <div className="flex gap-2">
            <SalesClosingExportButton data={data} />
            <Button asChild variant="outline">
              <Link href="/dashboard/sales" prefetch={false}>
                <ArrowLeft data-icon="inline-start" />
                Volver a ventas
              </Link>
            </Button>
          </div>
        </PageSubtitle.Actions>
      </PageSubtitle>

      <SalesClosingReport data={data} />
    </div>
  )
}
