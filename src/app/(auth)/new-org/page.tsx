import { redirect } from "next/navigation"

import ConfettiOnMount from "@/components/confetti-on-mount"
import { getDefaultLocation } from "@/server/actions/location/queries"
import { getOrganizationOnboardingStatus } from "@/server/actions/organization/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import OnboardingWizard from "@/app/(auth)/new-org/onboarding-wizard"
import { getCurrentUser } from "@/lib/session"

type StepKey = "logo" | "location" | "hours" | "menu"

function getRequestedStep(
  value: string | string[] | undefined,
  locationReady: boolean
): StepKey | undefined {
  if (typeof value !== "string") {
    return undefined
  }

  if (value === "hours") {
    return locationReady ? "hours" : undefined
  }

  if (value === "logo" || value === "location" || value === "menu") {
    return value
  }

  return undefined
}

function deriveStep({
  requestedStep,
  mediaReady,
  locationReady,
  hoursReady
}: {
  requestedStep: StepKey | undefined
  mediaReady: boolean
  locationReady: boolean
  hoursReady: boolean
}): StepKey {
  if (requestedStep) {
    return requestedStep
  }

  if (!mediaReady) {
    return "logo"
  }

  if (!locationReady) {
    return "location"
  }

  if (!hoursReady) {
    return "hours"
  }

  return "menu"
}

export const metadata = {
  title: "Crear nuevo negocio",
  description: "Configura una nueva organización para tu negocio"
}

export default async function NewOrgPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const [searchParams, currentOrg] = await Promise.all([
    props.searchParams,
    getCurrentOrganization()
  ])

  if (currentOrg) {
    const [onboardingStatus, location] = await Promise.all([
      getOrganizationOnboardingStatus(currentOrg.id),
      getDefaultLocation(currentOrg.id)
    ])

    const mediaReady = Boolean(
      onboardingStatus?.logo || onboardingStatus?.banner
    )
    const locationReady = Boolean(location)
    const hoursReady = Boolean(location?.openingHours.length)
    const menuItemsReady = Boolean(onboardingStatus?._count.menuItems)
    const requestedStep = getRequestedStep(searchParams.step, locationReady)

    if (menuItemsReady && !requestedStep) {
      redirect("/dashboard")
    }

    const initialStep = deriveStep({
      requestedStep,
      mediaReady,
      locationReady,
      hoursReady
    })

    return (
      <div className="mx-auto flex grow flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="max-w-3xl">
          <h1 className="font-display text-3xl font-semibold">
            Sigue configurando tu negocio
          </h1>
          <p
            className="text-muted-foreground mt-2 text-sm text-pretty
              sm:text-base"
          >
            Tu organización ya existe. Completa el resto del setup a tu ritmo y
            deja cualquier paso para después si lo necesitas.
          </p>
        </div>

        <OnboardingWizard
          organization={{
            id: currentOrg.id,
            name: currentOrg.name,
            slug: currentOrg.slug,
            logo: currentOrg.logo ?? null,
            banner: currentOrg.banner ?? null
          }}
          initialLocation={location}
          initialStep={initialStep}
          mediaReady={mediaReady}
          locationReady={locationReady}
          hoursReady={hoursReady}
          menuItemsReady={menuItemsReady}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      <ConfettiOnMount />
      <h1 className="font-display text-3xl font-semibold">
        ¡Bienvenido a Biztro 🎉!
      </h1>
      <p className="text-muted-foreground mt-2 text-pretty">
        Empecemos por lo esencial de tu negocio
      </p>
      <div className="mt-8 w-full max-w-5xl px-4 sm:px-6">
        <OnboardingWizard
          organization={null}
          initialLocation={null}
          initialStep="organization"
          mediaReady={false}
          locationReady={false}
          hoursReady={false}
          menuItemsReady={false}
          showOrganizationStep
        />
      </div>
    </div>
  )
}
