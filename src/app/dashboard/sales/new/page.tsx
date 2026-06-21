import { ArrowLeft, ShoppingBag } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { QuickSaleScreen } from "@/components/sales/quick-sale-screen"
import { Button } from "@/components/ui/button"
import { getSalesCatalog } from "@/server/actions/sales/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"

export const metadata: Metadata = {
  title: "Nueva venta"
}

export default async function NewSalePage() {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    notFound()
  }

  const catalog = await getSalesCatalog(currentOrg.id)

  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6"
    >
      <PageSubtitle>
        <PageSubtitle.Icon icon={ShoppingBag} />
        <PageSubtitle.Title>Nueva venta</PageSubtitle.Title>
        <PageSubtitle.Description>
          Captura rápida para mostrador e iPad
        </PageSubtitle.Description>
        <PageSubtitle.Actions>
          <Button asChild variant="outline">
            <Link href="/dashboard/sales" prefetch={false}>
              <ArrowLeft data-icon="inline-start" />
              Volver a ventas
            </Link>
          </Button>
        </PageSubtitle.Actions>
      </PageSubtitle>

      <QuickSaleScreen catalog={catalog} />
    </div>
  )
}
