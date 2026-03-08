import { simulatePdfAi } from "@/flags"
import { FileText } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import MenuImportForm from "@/app/dashboard/menu-items/menu-import/menu-import-form"

export const metadata: Metadata = {
  title: "Importar Productos desde Archivo"
}

export default async function PdfImportPage() {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    return notFound()
  }

  const simulateEnabled = await simulatePdfAi()

  const isPro = currentOrg.plan?.toUpperCase() === "PRO"

  return (
    <div className="mx-auto w-full min-w-0 grow px-4 sm:px-6">
      <PageSubtitle>
        <PageSubtitle.Icon icon={FileText} />
        <PageSubtitle.Title>Importar desde PDF o imagen</PageSubtitle.Title>
        <PageSubtitle.Description>
          Sube un PDF o imagen de tu menú y extrae los productos automáticamente
          con IA
        </PageSubtitle.Description>
      </PageSubtitle>
      <div className="mt-6">
        <MenuImportForm simulateEnabled={simulateEnabled} isPro={isPro} />
      </div>
    </div>
  )
}
