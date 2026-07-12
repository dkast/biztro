import { notFound } from "next/navigation"

import { SaleDetailSheet } from "@/components/sales/sale-detail-sheet"
import { getSaleDetail } from "@/server/actions/sales/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"

export default async function SaleDetailModal(props: {
  params: Promise<{ id: string }>
}) {
  const [{ id }, organization] = await Promise.all([
    props.params,
    getCurrentOrganization()
  ])

  if (!organization) notFound()

  const sale = await getSaleDetail(organization.id, id)

  if (!sale) notFound()

  return <SaleDetailSheet sale={sale} />
}
