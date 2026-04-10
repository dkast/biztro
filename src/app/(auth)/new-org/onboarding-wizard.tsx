"use client"

import { useState } from "react"
import { type Location } from "@/generated/prisma-client/client"
import { type Body, type Meta, type UploadResult } from "@uppy/core"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

import { EmptyImageField } from "@/components/dashboard/empty-image-field"
import { FileUploader } from "@/components/dashboard/file-uploader"
import { ImageField } from "@/components/dashboard/image-field"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
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
import NewOrgForm, {
  type BootstrappedOrganization
} from "@/app/(auth)/new-org/new-org-form"
import MenuImportOptions from "@/app/dashboard/menu-items/import-options"
import HoursForm from "@/app/dashboard/settings/locations/hours-form"
import LocationForm from "@/app/dashboard/settings/locations/location-form"
import { ImageType } from "@/lib/types/media"
import { getInitials } from "@/lib/utils"

type StepKey = "organization" | "logo" | "location" | "hours" | "menu"

type SetupOrganization = {
  id: string
  name: string
  slug: string
  logo: string | null
  banner: string | null
}

type SetupLocation = Awaited<ReturnType<typeof getDefaultLocation>>

type ResolvedSteps = Record<StepKey, boolean>
type ReachableSteps = Record<StepKey, boolean>

const ALL_STEP_ORDER: StepKey[] = [
  "organization",
  "logo",
  "location",
  "hours",
  "menu"
]

const CREATION_STEP_ORDER: StepKey[] = [
  "organization",
  "logo",
  "location",
  "hours",
  "menu"
]

const DEFAULT_STEP_ORDER: StepKey[] = ["logo", "location", "hours", "menu"]

const STEP_DETAILS: Record<
  StepKey,
  {
    value: StepKey
    title: string
    description: string
  }
> = {
  organization: {
    value: "organization",
    title: "Negocio",
    description: "Crea tu organización"
  },
  logo: {
    value: "logo",
    title: "Imágenes",
    description: "Sube tu logo y portada"
  },
  location: {
    value: "location",
    title: "Sucursal",
    description: "Agrega tu primera ubicación"
  },
  hours: {
    value: "hours",
    title: "Horarios",
    description: "Define tus horas de atención"
  },
  menu: {
    value: "menu",
    title: "Productos",
    description: "Importa tu menu inicial"
  }
}

function getReachableSteps(
  activeStep: StepKey,
  stepOrder: StepKey[]
): ReachableSteps {
  const activeIndex = stepOrder.indexOf(activeStep)

  return ALL_STEP_ORDER.reduce((steps, step) => {
    const stepIndex = stepOrder.indexOf(step)
    steps[step] = stepIndex !== -1 && stepIndex <= activeIndex
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
    <Card className="border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-balance">{title}</CardTitle>
        <CardDescription className="text-pretty">{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export default function OnboardingWizard({
  organization,
  initialLocation,
  initialStep,
  mediaReady,
  locationReady,
  hoursReady,
  menuItemsReady,
  showOrganizationStep = false
}: {
  organization: SetupOrganization | null
  initialLocation: SetupLocation | null
  initialStep: StepKey
  mediaReady: boolean
  locationReady: boolean
  hoursReady: boolean
  menuItemsReady: boolean
  showOrganizationStep?: boolean
}) {
  const router = useRouter()
  const stepOrder = showOrganizationStep
    ? CREATION_STEP_ORDER
    : DEFAULT_STEP_ORDER
  const steps = stepOrder.map(step => STEP_DETAILS[step])
  const [activeStep, setActiveStep] = useState<StepKey>(initialStep)
  const [location, setLocation] = useState<Location | null>(initialLocation)
  const [resolvedSteps, setResolvedSteps] = useState<ResolvedSteps>({
    organization: !showOrganizationStep || Boolean(organization),
    logo: mediaReady,
    location: locationReady,
    hours: hoursReady,
    menu: menuItemsReady
  })
  const [reachableSteps, setReachableSteps] = useState<ReachableSteps>(
    getReachableSteps(initialStep, stepOrder)
  )
  const [logoUploaded, setLogoUploaded] = useState(Boolean(organization?.logo))
  const [bannerUploaded, setBannerUploaded] = useState(
    Boolean(organization?.banner)
  )
  const [isLogoDialogOpen, setLogoDialogOpen] = useState(false)

  const markStepResolved = (step: StepKey) => {
    setResolvedSteps(current => ({ ...current, [step]: true }))
  }

  const moveToStep = (step: StepKey) => {
    setActiveStep(step)
    setReachableSteps(current => ({
      ...current,
      ...getReachableSteps(step, stepOrder)
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

  const handleOrganizationCreated = (
    _organization: BootstrappedOrganization
  ) => {
    markStepResolved("organization")
    router.replace("/new-org?step=logo")
  }

  const handleLogoUploaded = (_result: UploadResult<Meta, Body>) => {
    setLogoUploaded(true)
    setLogoDialogOpen(false)
    markStepResolved("logo")
    router.refresh()
  }

  const handleBannerUploaded = () => {
    setBannerUploaded(true)
    markStepResolved("logo")
    router.refresh()
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
    organization: !reachableSteps.organization,
    logo: !reachableSteps.logo,
    location: !reachableSteps.location,
    hours: !reachableSteps.hours,
    menu: !reachableSteps.menu
  } satisfies Record<StepKey, boolean>

  const menuImportHref = `/dashboard/menu-items/menu-import?returnTo=${encodeURIComponent("/new-org?step=menu")}`
  const hoursData =
    initialLocation && location?.id === initialLocation.id
      ? initialLocation
      : null
  const hasUploadedMedia = logoUploaded || bannerUploaded

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Stepper
        value={activeStep}
        onValueChange={value => moveToStep(value as StepKey)}
        activationMode="manual"
      >
        <StepperList>
          {steps.map(step => (
            <StepperItem
              key={step.value}
              value={step.value}
              completed={resolvedSteps[step.value]}
              disabled={stepDisabled[step.value]}
            >
              <StepperTrigger>
                <StepperIndicator />
                <div className="flex flex-col gap-0.5">
                  <StepperTitle>{step.title}</StepperTitle>
                  <StepperDescription>{step.description}</StepperDescription>
                </div>
              </StepperTrigger>
              <StepperSeparator className="mx-4" />
            </StepperItem>
          ))}
        </StepperList>

        {showOrganizationStep ? (
          <StepperContent value="organization" className="mt-6">
            <StepShell
              title="Crea tu negocio"
              description="Empieza con la información básica de tu organización y continúa con el resto de la configuración."
            >
              <NewOrgForm
                withCard={false}
                submitLabel="Crear negocio y continuar"
                onSuccess={handleOrganizationCreated}
              />
            </StepShell>
          </StepperContent>
        ) : null}

        <StepperContent value="logo" className="mt-6">
          <StepShell
            title="Logo y portada"
            description="Sube tu logo desde un diálogo y agrega también una portada para tu sitio. Puedes dejar cualquiera para después."
          >
            {organization ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Avatar className="size-24 rounded-3xl">
                    {organization.logo ? (
                      <AvatarImage
                        src={organization.logo}
                        className="rounded-3xl"
                      />
                    ) : null}
                    <AvatarFallback className="text-3xl">
                      {getInitials(organization.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="font-medium text-balance">
                        {organization.name}
                      </p>
                      <p className="text-muted-foreground text-sm text-pretty">
                        {hasUploadedMedia
                          ? "Ya tienes recursos visuales cargados. Puedes reemplazarlos o continuar."
                          : "Recomendado: logo 500x500 y portada 1200x800 en JPG o PNG."}
                      </p>
                    </div>
                    <Dialog
                      open={isLogoDialogOpen}
                      onOpenChange={setLogoDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline">
                          {logoUploaded ? "Cambiar logo" : "Subir logo"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xl">
                        <DialogHeader>
                          <DialogTitle>Subir imágen</DialogTitle>
                        </DialogHeader>
                        <FileUploader
                          organizationId={organization.id}
                          imageType={ImageType.LOGO}
                          objectId={ImageType.LOGO}
                          limitDimension={500}
                          onUploadSuccess={handleLogoUploaded}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="font-medium text-balance">
                      Imágen de portada
                    </p>
                    <p className="text-muted-foreground text-sm text-pretty">
                      Se mostrará de forma prominente en tu sitio. Recomendado:
                      1200x800 en JPG o PNG.
                    </p>
                  </div>
                  {organization.banner ? (
                    <ImageField
                      src={organization.banner}
                      organizationId={organization.id}
                      imageType={ImageType.BANNER}
                      objectId={ImageType.BANNER}
                      onUploadSuccess={handleBannerUploaded}
                    />
                  ) : (
                    <EmptyImageField
                      organizationId={organization.id}
                      imageType={ImageType.BANNER}
                      objectId={ImageType.BANNER}
                      onUploadSuccess={handleBannerUploaded}
                    />
                  )}
                </div>
                <div
                  className="flex flex-col gap-2 sm:flex-row sm:justify-between"
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
                      disabled={!hasUploadedMedia}
                      onClick={handleLogoContinue}
                    >
                      Continuar
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-pretty">
                Primero crea tu negocio para poder subir el logo.
              </p>
            )}
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
                location ? "Guardar cambios y continuar" : "Guardar y continuar"
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
                className="border-border/60 flex flex-col gap-4 rounded-2xl
                  border border-dashed p-6"
              >
                <p className="text-muted-foreground text-sm text-pretty">
                  Sin una sucursal no puedes guardar horarios todavia. Puedes
                  continuar con la importacion de productos y completar esto
                  despues desde configuracion.
                </p>
                <div
                  className="flex flex-col gap-2 sm:flex-row sm:justify-between"
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
  )
}
