import { simulatePdfAi } from "@/flags"
import { FileText } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { Button } from "@/components/ui/button"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import PdfImportForm from "@/app/dashboard/menu-items/pdf-import/pdf-import-form"

export const metadata: Metadata = {
  title: "Importar Productos desde PDF"
}

export default async function PdfImportPage() {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    return notFound()
  }

  const simulateEnabled = await simulatePdfAi()

  return (
    <div className="mx-auto w-full max-w-5xl grow px-4 sm:px-6">
      <PageSubtitle>
        <PageSubtitle.Icon icon={FileText} />
        <PageSubtitle.Title>Importar desde PDF</PageSubtitle.Title>
        <PageSubtitle.Description>
          Sube un PDF de tu menú y extrae los productos automáticamente con IA
        </PageSubtitle.Description>
        <PageSubtitle.Actions>
          <Button variant="outline" asChild size="sm">
            <Link href="/dashboard/menu-items">Cancelar</Link>
          </Button>
        </PageSubtitle.Actions>
      </PageSubtitle>
      <div className="mt-6">
        <PdfImportForm simulateEnabled={simulateEnabled} />
      </div>
    </div>
  )
}
