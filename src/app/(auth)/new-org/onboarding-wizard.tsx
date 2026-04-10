"use client"

import { useState } from "react"
import { type Location } from "@/generated/prisma-client/client"
import { type Body, type Meta, type UploadResult } from "@uppy/core"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ImagePlus,
  MapPin,
  ShoppingBag
} from "lucide-react"
import { useRouter } from "next/navigation"

import { FileUploader } from "@/components/dashboard/file-uploader"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperSeparator,
  StepperTitle,
  StepperTrigger
} from "@/components/ui/stepper"
import type { getDefaultLocation } from "@/server/actions/location/queries"
import MenuImportOptions from "@/app/dashboard/menu-items/import-options"
import HoursForm from "@/app/dashboard/settings/locations/hours-form"
import LocationForm from "@/app/dashboard/settings/locations/location-form"
import { ImageType } from "@/lib/types/media"
import { getInitials } from "@/lib/utils"

type StepKey = "logo" | "location" | "hours" | "menu"

type SetupOrganization = {
  id: string
  name: string
  slug: string
  logo: string | null
}

type SetupLocation = Awaited<ReturnType<typeof getDefaultLocation>>

type ResolvedSteps = Record<StepKey, boolean>
type ReachableSteps = Record<StepKey, boolean>

const STEP_ORDER: StepKey[] = ["logo", "location", "hours", "menu"]

const STEPS: Array<{
  value: StepKey
  title: string
  description: string
  icon: typeof ImagePlus
}> = [
  {
    value: "logo",
    title: "Logo",
    description: "Sube tu identidad visual",
    icon: ImagePlus
  },
  {
    value: "location",
    title: "Sucursal",
    description: "Agrega tu primera ubicación",
    icon: MapPin
  },
  {
    value: "hours",
    title: "Horarios",
    description: "Define tus horas de atención",
    icon: Clock3
  },
  {
    value: "menu",
    title: "Productos",
    description: "Importa tu menu inicial",
    icon: ShoppingBag
  }
]

function getReachableSteps(activeStep: StepKey): ReachableSteps {
  const activeIndex = STEP_ORDER.indexOf(activeStep)

  return STEP_ORDER.reduce((steps, step, index) => {
    steps[step] = index <= activeIndex
    return steps
  }, {} as ReachableSteps)
}

function StepShell({
  title,
  description,
  children
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Card className="border-white/60 bg-white/95 shadow-2xl backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export default function OnboardingWizard({
  organization,
  initialLocation,
  initialStep,
  orgReady,
  locationReady,
  hoursReady,
  menuItemsReady
}: {
  organization: SetupOrganization
  initialLocation: SetupLocation | null
  initialStep: StepKey
  orgReady: boolean
  locationReady: boolean
  hoursReady: boolean
  menuItemsReady: boolean
}) {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState<StepKey>(initialStep)
  const [location, setLocation] = useState<Location | null>(initialLocation)
  const [resolvedSteps, setResolvedSteps] = useState<ResolvedSteps>({
    logo: orgReady,
    location: locationReady,
    hours: hoursReady,
    menu: menuItemsReady
  })
  const [reachableSteps, setReachableSteps] = useState<ReachableSteps>(
    getReachableSteps(initialStep)
  )
  const [logoUploaded, setLogoUploaded] = useState(orgReady)

  const markStepResolved = (step: StepKey) => {
    setResolvedSteps(current => ({ ...current, [step]: true }))
  }

  const moveToStep = (step: StepKey) => {
    setActiveStep(step)
    setReachableSteps(current => ({
      ...current,
      ...getReachableSteps(step)
    }))

    if (typeof window !== "undefined") {
      const nextUrl = new URL(window.location.href)
      nextUrl.searchParams.set("step", step)
      window.history.replaceState(window.history.state, "", nextUrl)
    }
  }

  const goToDashboard = () => {
    router.push("/dashboard")
  }

  const handleLogoUploaded = (_result: UploadResult<Meta, Body>) => {
    setLogoUploaded(true)
  }

  const handleLogoContinue = () => {
    markStepResolved("logo")
    moveToStep("location")
  }

  const handleLocationSaved = (nextLocation: Location) => {
    setLocation(nextLocation)
    markStepResolved("location")
    moveToStep("hours")
  }

  const handleLocationSkip = () => {
    setLocation(null)
    markStepResolved("location")
    moveToStep("hours")
  }

  const handleHoursSaved = () => {
    markStepResolved("hours")
    moveToStep("menu")
  }

  const handleFinishHoursStep = () => {
    markStepResolved("hours")
    moveToStep("menu")
  }

  const handleMenuImported = () => {
    markStepResolved("menu")
    goToDashboard()
  }

  const stepDisabled = {
    logo: !reachableSteps.logo,
    location: !reachableSteps.location,
    hours: !reachableSteps.hours,
    menu: !reachableSteps.menu
  } satisfies Record<StepKey, boolean>

  const menuImportHref = `/dashboard/menu-items/menu-import?returnTo=${encodeURIComponent("/dashboard/onboarding?step=menu")}`
  const hoursData =
    initialLocation && location?.id === initialLocation.id
      ? initialLocation
      : null

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div
        className="mb-6 rounded-[28px] border border-white/50 bg-white/75 p-4
          shadow-2xl backdrop-blur-md sm:p-6"
      >
        <Stepper
          value={activeStep}
          onValueChange={value => moveToStep(value as StepKey)}
          activationMode="manual"
        >
          <StepperList className="gap-3 overflow-x-auto pb-2">
            {STEPS.map(step => {
              const Icon = step.icon

              return (
                <StepperItem
                  key={step.value}
                  value={step.value}
                  completed={resolvedSteps[step.value]}
                  disabled={stepDisabled[step.value]}
                  className="min-w-55"
                >
                  <StepperTrigger
                    className="data-[state=active]:border-primary w-full border
                      border-transparent bg-white/80 px-3 py-3 shadow-sm"
                  >
                    <StepperIndicator>
                      {resolvedSteps[step.value] ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        <Icon className="size-4" />
                      )}
                    </StepperIndicator>
                    <span className="flex min-w-0 flex-col">
                      <StepperTitle>{step.title}</StepperTitle>
                      <StepperDescription>
                        {step.description}
                      </StepperDescription>
                    </span>
                  </StepperTrigger>
                  <StepperSeparator className="mx-3 hidden sm:block" />
                </StepperItem>
              )
            })}
          </StepperList>

          <StepperContent value="logo" className="mt-6">
            <StepShell
              title="Logo del negocio"
              description="Puedes subir tu logo ahora o dejarlo para después. Esta información también alimenta las tarjetas de onboarding del dashboard."
            >
              <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div
                  className="flex flex-col items-center justify-center gap-4
                    rounded-2xl border border-dashed p-6 text-center"
                >
                  <Avatar className="size-24 rounded-3xl">
                    <AvatarFallback className="text-3xl">
                      {getInitials(organization.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{organization.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {logoUploaded
                        ? "Tu logo ya se subió. Puedes continuar o reemplazarlo."
                        : "Recomendado: 500x500 en JPG o PNG."}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <FileUploader
                    organizationId={organization.id}
                    imageType={ImageType.LOGO}
                    objectId={ImageType.LOGO}
                    limitDimension={500}
                    onUploadSuccess={handleLogoUploaded}
                  />
                  <div
                    className="flex flex-col gap-2 sm:flex-row
                      sm:justify-between"
                  >
                    <Button type="button" variant="ghost" disabled>
                      <ArrowLeft className="mr-2 size-4" />
                      Negocio creado
                    </Button>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleLogoContinue}
                      >
                        Omitir por ahora
                      </Button>
                      <Button
                        type="button"
                        disabled={!logoUploaded}
                        onClick={handleLogoContinue}
                      >
                        Continuar
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </StepShell>
          </StepperContent>

          <StepperContent value="location" className="mt-6">
            <StepShell
              title="Tu primera sucursal"
              description="Agrega una ubicación principal. Puedes editarla más tarde desde configuración."
            >
              <LocationForm
                data={location}
                enabled
                submitLabel={
                  location
                    ? "Guardar cambios y continuar"
                    : "Guardar y continuar"
                }
                onSuccess={handleLocationSaved}
                secondaryAction={
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLocationSkip}
                  >
                    Omitir por ahora
                  </Button>
                }
              />
            </StepShell>
          </StepperContent>

          <StepperContent value="hours" className="mt-6">
            <StepShell
              title="Horarios de atención"
              description="Configura tus horarios de apertura. También puedes dejar esto para más tarde."
            >
              {location ? (
                <HoursForm
                  data={hoursData}
                  locationId={location.id}
                  submitLabel="Guardar y continuar"
                  onSuccess={handleHoursSaved}
                  secondaryAction={
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleFinishHoursStep}
                    >
                      Omitir por ahora
                    </Button>
                  }
                />
              ) : (
                <div
                  className="flex flex-col gap-4 rounded-2xl border
                    border-dashed p-6"
                >
                  <p className="text-muted-foreground text-sm">
                    Sin una sucursal no puedes guardar horarios todavia. Puedes
                    continuar con la importacion de productos y completar esto
                    despues desde configuracion.
                  </p>
                  <div
                    className="flex flex-col gap-2 sm:flex-row
                      sm:justify-between"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => moveToStep("location")}
                    >
                      <ArrowLeft className="mr-2 size-4" />
                      Regresar
                    </Button>
                    <Button type="button" onClick={handleFinishHoursStep}>
                      Continuar con productos
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </StepShell>
          </StepperContent>

          <StepperContent value="menu" className="mt-6">
            <StepShell
              title="Importa tus productos"
              description="Puedes cargar un CSV aqui mismo o usar el flujo con IA para extraer tu menu desde PDF o imagen."
            >
              <MenuImportOptions
                aiImportHref={menuImportHref}
                onCsvSuccess={handleMenuImported}
              />
              <div
                className="mt-6 flex flex-col gap-2 sm:flex-row
                  sm:justify-between"
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => moveToStep(location ? "hours" : "location")}
                >
                  <ArrowLeft className="mr-2 size-4" />
                  Regresar
                </Button>
                <Button type="button" variant="outline" onClick={goToDashboard}>
                  Omitir por ahora
                </Button>
              </div>
            </StepShell>
          </StepperContent>
        </Stepper>
      </div>
    </div>
  )
}
