import { redirect } from "next/navigation"

import ConfettiOnMount from "@/components/confetti-on-mount"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import NewOrgForm from "@/app/(auth)/new-org/new-org-form"
import { getCurrentUser } from "@/lib/session"

export const metadata = {
  title: "Crear nuevo negocio",
  description: "Configura una nueva organización para tu negocio"
}

export default async function NewOrgPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const currentOrg = await getCurrentOrganization()

  if (currentOrg) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      <ConfettiOnMount />
      <h1 className="font-display text-3xl font-semibold">
        ¡Bienvenido a Biztro 🎉!
      </h1>
      <p className="text-muted-foreground mt-2">
        Empecemos por lo esencial de tu negocio
      </p>
      <div className="mt-8 w-full max-w-lg px-4 sm:px-6">
        <NewOrgForm
          submitLabel="Crear negocio y continuar"
          redirectTo="/dashboard/onboarding?step=logo"
        />
      </div>
    </div>
  )
}
