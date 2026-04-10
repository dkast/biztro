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

function getReturnTo(value: string | string[] | undefined) {
  if (typeof value !== "string") {
    return undefined
  }

  return value.startsWith("/dashboard") ? value : undefined
}

export default async function PdfImportPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [currentOrg, searchParams] = await Promise.all([
    getCurrentOrganization(),
    props.searchParams
  ])

  if (!currentOrg) {
    return notFound()
  }

  const simulateEnabled = await simulatePdfAi()

  const isPro = currentOrg.plan?.toUpperCase() === "PRO"
  const returnTo = getReturnTo(searchParams.returnTo)

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
      <div className="mt-10">
        <MenuImportForm
          simulateEnabled={simulateEnabled}
          isPro={isPro}
          returnTo={returnTo}
        />
      </div>
    </div>
  )
}
