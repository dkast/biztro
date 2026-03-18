import { Languages } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { getAvailableTranslationsForCurrentOrg } from "@/server/actions/item/translations"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import TranslationsManager from "@/app/dashboard/menu-items/translations/translations-manager"

export const metadata: Metadata = {
  title: "Traducciones del Menú"
}

export default async function TranslationsPage() {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    return notFound()
  }

  const availableTranslations = await getAvailableTranslationsForCurrentOrg()

  return (
    <div className="mx-auto grow px-4 sm:px-6">
      <PageSubtitle>
        <PageSubtitle.Icon icon={Languages} />
        <PageSubtitle.Title>Traducciones del Menú</PageSubtitle.Title>
        <PageSubtitle.Description>
          Genera traducciones de tus productos con IA para mostrar el menú en
          otros idiomas
        </PageSubtitle.Description>
      </PageSubtitle>
      <div className="mt-6">
        <TranslationsManager availableTranslations={availableTranslations} />
      </div>
    </div>
  )
}
