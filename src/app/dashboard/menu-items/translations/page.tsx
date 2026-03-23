import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getAvailableTranslations } from "@/server/actions/item/translations"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import TranslationsManager from "@/app/dashboard/menu-items/translations/translations-manager"
import { SubscriptionStatus } from "@/lib/types/billing"

export const metadata: Metadata = {
  title: "Traducciones del Menú"
}

export default async function TranslationsPage() {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    return notFound()
  }

  const availableTranslations = await getAvailableTranslations(currentOrg.id)
  const isPro =
    currentOrg.plan?.toUpperCase() === "PRO" ||
    currentOrg.status === SubscriptionStatus.SPONSORED

  return (
    <div className="mx-auto grow px-4 sm:px-6">
      <TranslationsManager
        key={currentOrg.id}
        availableTranslations={availableTranslations}
        isPro={isPro}
      />
    </div>
  )
}
