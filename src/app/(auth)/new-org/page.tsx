import { redirect } from "next/navigation"

import ConfettiOnMount from "@/components/confetti-on-mount"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import NewOrgForm from "@/app/(auth)/new-org/new-org-form"

export default async function NewOrgPage() {
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
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Cuéntanos un poco sobre tu negocio
      </p>
      <div className="mt-8">
        <NewOrgForm />
      </div>
    </div>
  )
}
