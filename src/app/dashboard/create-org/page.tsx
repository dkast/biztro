import { Store } from "lucide-react"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import NewOrgForm from "../../(auth)/new-org/new-org-form"

export const metadata = {
  title: "Crear Organización",
  description: "Crea y configura tu negocio en Biztro"
}

export default function Page() {
  return (
    <div className="flex grow py-4">
      <div className="mx-auto flex max-w-2xl grow flex-col gap-4 px-4 sm:px-0">
        <PageSubtitle>
          <PageSubtitle.Icon icon={Store} />
          <PageSubtitle.Title>Crear Organización</PageSubtitle.Title>
          <PageSubtitle.Description>
            Información básica del negocio
          </PageSubtitle.Description>
        </PageSubtitle>
        <NewOrgForm />
      </div>
    </div>
  )
}
