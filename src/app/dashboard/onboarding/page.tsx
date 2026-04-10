import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getDefaultLocation } from "@/server/actions/location/queries"
import { getOrganizationOnboardingStatus } from "@/server/actions/organization/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import OnboardingWizard from "@/app/(auth)/new-org/onboarding-wizard"

type StepKey = "logo" | "location" | "hours" | "menu"

export const metadata: Metadata = {
  title: "Completar configuracion"
}

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
  orgReady,
  locationReady,
  hoursReady
}: {
  requestedStep: StepKey | undefined
  orgReady: boolean
  locationReady: boolean
  hoursReady: boolean
}): StepKey {
  if (requestedStep) {
    return requestedStep
  }

  if (!orgReady) {
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

export default async function DashboardOnboardingPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [searchParams, organization] = await Promise.all([
    props.searchParams,
    getCurrentOrganization()
  ])

  if (!organization) {
    redirect("/new-org")
  }

  const [onboardingStatus, location] = await Promise.all([
    getOrganizationOnboardingStatus(organization.id),
    getDefaultLocation(organization.id)
  ])

  const orgReady = Boolean(onboardingStatus?.logo)
  const locationReady = Boolean(location)
  const hoursReady = Boolean(location?.openingHours.length)
  const menuItemsReady = Boolean(onboardingStatus?._count.menuItems)
  const requestedStep = getRequestedStep(searchParams.step, locationReady)

  if (menuItemsReady && !requestedStep) {
    redirect("/dashboard")
  }

  const initialStep = deriveStep({
    requestedStep,
    orgReady,
    locationReady,
    hoursReady
  })

  return (
    <div className="mx-auto flex grow flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="max-w-3xl">
        <h1 className="font-display text-3xl font-semibold">
          Sigue configurando tu negocio
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Tu organizacion ya existe. Completa el resto del setup a tu ritmo y
          deja cualquier paso para despues si lo necesitas.
        </p>
      </div>

      <OnboardingWizard
        organization={{
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo ?? null
        }}
        initialLocation={location}
        initialStep={initialStep}
        orgReady={orgReady}
        locationReady={locationReady}
        hoursReady={hoursReady}
        menuItemsReady={menuItemsReady}
      />
    </div>
  )
}
