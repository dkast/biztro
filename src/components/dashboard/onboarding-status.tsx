import {
  ArrowRight,
  CheckCircle,
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
import { getOrganizationOnboardingStatus } from "@/server/actions/organization/queries"

export default async function OnboardingStatus({ orgId }: { orgId: string }) {
  const orgData = await getOrganizationOnboardingStatus(orgId)

  // console.dir(orgData?.location)

  const orgReady = orgData?.logo
  const locationReady = orgData?.location.length
    ? orgData.location.length > 0
    : false
  const menuItemsReady = orgData?._count.menuItems
    ? orgData._count.menuItems > 0
    : false

  let progress = 0
  progress +=
    (orgReady ? 33 : 0) + (locationReady ? 33 : 0) + (menuItemsReady ? 34 : 0)
  return (
    <>
      <PageSubtitle
        title="Bienvenido a Biztro"
        description="Puedes iniciar completando los siguientes pasos para tener tú menú listo."
      >
        <OnboardingProgress progres={progress} />
      </PageSubtitle>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <Card className="rounded-xl p-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-1 pb-2">
            <div className="flex flex-row items-center gap-2">
              <Badge className="p-2" variant="violet">
                <Store className="text-muted-foreground size-4" />
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
                    {"Listo"}
                  </>
                ) : (
                  <>
                    {"Ver"}
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            <CardDescription className="text-xs">
              Captura la información de tu negocio, como nombre, logo, etc.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="rounded-xl p-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-1 pb-2">
            <div className="flex flex-row items-center gap-2">
              <Badge className="p-2" variant="destructive">
                <MapPin className="text-muted-foreground size-4" />
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
                    {"Listo"}
                  </>
                ) : (
                  <>
                    {"Ver"}
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            <CardDescription className="text-xs">
              Registra la dirección, horarios y redes sociales.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="rounded-xl p-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-1 pb-2">
            <div className="flex flex-row items-center gap-2">
              <Badge className="p-2" variant="green">
                <ShoppingBag className="text-muted-foreground size-4" />
              </Badge>
              <CardTitle className="text-lg font-medium">Productos</CardTitle>
            </div>
            <Link href="/dashboard/menu-items">
              <Button
                variant={menuItemsReady ? "secondary" : "outline"}
                size="xs"
                className="flex-rwo flex gap-2"
              >
                {menuItemsReady ? (
                  <>
                    <CheckCircle className="size-4" />
                    {"Listo"}
                  </>
                ) : (
                  <>
                    {"Ver"}
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            <CardDescription className="text-xs">
              Crea tus productos y categorías para tu menú.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
