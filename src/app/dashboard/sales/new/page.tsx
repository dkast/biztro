import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { QuickSaleScreen } from "@/components/sales/quick-sale-screen"
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
      <QuickSaleScreen catalog={catalog} />
    </div>
  )
}
