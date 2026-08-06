import { WalletCards } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { ReceivablesList } from "@/components/receivables/receivables-list"
import { getReceivableCustomers } from "@/server/actions/customers/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"

export const metadata: Metadata = {
  title: "Cartera"
}

export default async function ReceivablesPage() {
  const organization = await getCurrentOrganization()
  if (!organization) notFound()

  const customers = await getReceivableCustomers(organization.id)

  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:gap-8
        sm:px-6 sm:py-6"
    >
      <PageSubtitle>
        <PageSubtitle.Icon icon={WalletCards} />
        <PageSubtitle.Title>Cartera</PageSubtitle.Title>
        <PageSubtitle.Description>
          Saldos pendientes y abonos de clientes
        </PageSubtitle.Description>
      </PageSubtitle>
      <ReceivablesList customers={customers} />
    </div>
  )
}
