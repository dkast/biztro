import { Banknote, Plus, ReceiptText } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { SalesDashboard } from "@/components/sales/sales-dashboard"
import { Button } from "@/components/ui/button"
import { getSalesDashboardData } from "@/server/actions/sales/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"

export const metadata: Metadata = {
  title: "Ventas"
}

export default async function SalesPage() {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    notFound()
  }

  const data = await getSalesDashboardData(currentOrg.id)

  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6"
    >
      <PageSubtitle>
        <PageSubtitle.Icon icon={Banknote} />
        <PageSubtitle.Title>Ventas</PageSubtitle.Title>
        <PageSubtitle.Description>
          Captura rápida y métricas de ventas
        </PageSubtitle.Description>
        <PageSubtitle.Actions>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/dashboard/sales/new" prefetch={false}>
                <Plus data-icon="inline-start" />
                Nueva venta
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/sales/closing" prefetch={false}>
                <ReceiptText data-icon="inline-start" />
                Cierre diario
              </Link>
            </Button>
          </div>
        </PageSubtitle.Actions>
      </PageSubtitle>

      <SalesDashboard data={data} />
    </div>
  )
}
