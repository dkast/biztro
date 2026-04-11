import { redirect } from "next/navigation"

import ConfettiOnMount from "@/components/confetti-on-mount"
import PageSubtitle from "@/components/dashboard/page-subtitle"
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

  const [onboardingStatus, location] = currentOrg
    ? await Promise.all([
        getOrganizationOnboardingStatus(currentOrg.id),
        getDefaultLocation(currentOrg.id)
      ])
    : [null, null]

  const mediaReady = Boolean(onboardingStatus?.logo || onboardingStatus?.banner)
  const locationReady = Boolean(location)
  const hoursReady = Boolean(location?.openingHours.length)
  const menuItemsReady = Boolean(onboardingStatus?._count.menuItems)
  const requestedStep = currentOrg
    ? getRequestedStep(searchParams.step, locationReady)
    : undefined

  if (currentOrg && menuItemsReady && !requestedStep) {
    redirect("/dashboard")
  }

  const initialStep = currentOrg
    ? deriveStep({
        requestedStep,
        mediaReady,
        locationReady,
        hoursReady
      })
    : "organization"

  return (
    <div className="flex min-h-dvh items-center">
      {!currentOrg && <ConfettiOnMount />}
      <div
        className="mx-auto flex w-full max-w-5xl flex-col gap-20 px-4 py-8
          sm:px-6"
      >
        <PageSubtitle className="w-full max-w-3xl">
          <PageSubtitle.Title
            className="font-display text-2xl font-semibold text-balance
              sm:text-4xl"
          >
            Bienvenido a Biztro
          </PageSubtitle.Title>
          <PageSubtitle.Description className="mt-2 text-pretty sm:text-base">
            Completa esta configuración paso a paso. Puedes omitir cualquier
            parte y volver más tarde desde el dashboard.
          </PageSubtitle.Description>
        </PageSubtitle>

        <OnboardingWizard
          organization={
            currentOrg
              ? {
                  id: currentOrg.id,
                  name: currentOrg.name,
                  slug: currentOrg.slug,
                  logo: currentOrg.logo ?? null,
                  banner: currentOrg.banner ?? null
                }
              : null
          }
          initialLocation={location}
          initialStep={initialStep}
          mediaReady={mediaReady}
          locationReady={locationReady}
          hoursReady={hoursReady}
          menuItemsReady={menuItemsReady}
          showOrganizationStep={!currentOrg}
        />
      </div>
    </div>
  )
}
