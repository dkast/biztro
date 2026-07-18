import { ReceiptText } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { SaleDetailView } from "@/components/sales/sale-detail"
import { getSaleDetail } from "@/server/actions/sales/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"

export const metadata: Metadata = {
  title: "Detalle de venta"
}

export default async function SaleDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const [{ id }, organization] = await Promise.all([
    props.params,
    getCurrentOrganization()
  ])

  if (!organization) notFound()

  const sale = await getSaleDetail(organization.id, id)

  if (!sale) notFound()

  return (
    <div
      className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-5 sm:px-6
        sm:py-6"
    >
      <PageSubtitle>
        <PageSubtitle.Icon icon={ReceiptText} />
        <PageSubtitle.Title>Detalle de venta</PageSubtitle.Title>
        <PageSubtitle.Description>
          Auditoría de la transacción y sus productos
        </PageSubtitle.Description>
      </PageSubtitle>
      <SaleDetailView sale={sale} />
    </div>
  )
}
