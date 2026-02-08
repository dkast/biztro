"use client"

import { useAtom } from "jotai"
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  MapPin,
  ShoppingBag,
  Store
} from "lucide-react"
import Link from "next/link"

import OnboardingProgress from "@/components/dashboard/onboarding-progress"
import PageSubtitle from "@/components/dashboard/page-subtitle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import { onboardingCardsCollapsedAtom } from "@/lib/atoms"

interface OnboardingCardsProps {
  orgReady: boolean
  locationReady: boolean
  menuItemsReady: boolean
  progress: number
}

export function OnboardingCards({
  orgReady,
  locationReady,
  menuItemsReady,
  progress
}: OnboardingCardsProps) {
  const [isCollapsed, setIsCollapsed] = useAtom(onboardingCardsCollapsedAtom)

  return (
    <Collapsible
      open={!isCollapsed}
      onOpenChange={open => setIsCollapsed(!open)}
    >
      <div className="mb-4 flex items-end sm:mb-2 sm:items-center">
        <div className="grow">
          <PageSubtitle>
            <PageSubtitle.Title>Bienvenido a Biztro</PageSubtitle.Title>
            <PageSubtitle.Description>
              Aquí tienes algunos enlaces para comenzar a configurar tu negocio.
            </PageSubtitle.Description>
            <PageSubtitle.Actions>
              <OnboardingProgress progres={progress} />
            </PageSubtitle.Actions>
          </PageSubtitle>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronDown
              className={`h-4 w-4 transition-transform
                ${isCollapsed ? "" : "rotate-180"}`}
            />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <Card className="rounded-xl p-0">
            <CardHeader
              className="flex flex-row items-center justify-between space-y-1
                p-3 pb-1"
            >
              <div className="flex flex-row items-center gap-2">
                <Badge className="p-2" variant="violet">
                  <Store className="size-4" />
                </Badge>
                <CardTitle className="text-lg font-medium">Negocio</CardTitle>
              </div>
              <Link href="/dashboard/settings">
                <Button
                  variant={orgReady ? "secondary" : "outline"}
                  size="xs"
                  className="flex flex-row gap-2"
                >
                  {orgReady ? (
                    <>
                      <CheckCircle className="size-4" />
                      <span className="hidden xl:inline">Listo</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden xl:inline">Ver</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2 p-3">
              <CardDescription className="text-xs">
                Captura la información de tu negocio, como nombre, logo, etc.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="rounded-xl p-0">
            <CardHeader
              className="flex flex-row items-center justify-between space-y-1
                p-3 pb-1"
            >
              <div className="flex flex-row items-center gap-2">
                <Badge className="p-2" variant="destructive">
                  <MapPin className="size-4" />
                </Badge>
                <CardTitle className="text-lg font-medium">Sucursal</CardTitle>
              </div>
              <Link href="/dashboard/settings/locations">
                <Button
                  variant={locationReady ? "secondary" : "outline"}
                  size="xs"
                  className="flex flex-row gap-2"
                >
                  {locationReady ? (
                    <>
                      <CheckCircle className="size-4" />
                      <span className="hidden xl:inline">Listo</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden xl:inline">Ver</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2 p-3">
              <CardDescription className="text-xs">
                Registra la dirección, horarios y redes sociales.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="rounded-xl p-0">
            <CardHeader
              className="flex flex-row items-center justify-between space-y-1
                p-3 pb-1"
            >
              <div className="flex flex-row items-center gap-2">
                <Badge className="p-2" variant="green">
                  <ShoppingBag className="size-4" />
                </Badge>
                <CardTitle className="text-lg font-medium">Productos</CardTitle>
              </div>
              <Link href="/dashboard/menu-items">
                <Button
                  variant={menuItemsReady ? "secondary" : "outline"}
                  size="xs"
                  className="flex flex-row gap-2"
                >
                  {menuItemsReady ? (
                    <>
                      <CheckCircle className="size-4" />
                      <span className="hidden xl:inline">Listo</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden xl:inline">Ver</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2 p-3">
              <CardDescription className="text-xs">
                Crea tus productos y categorías para tu menú.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
