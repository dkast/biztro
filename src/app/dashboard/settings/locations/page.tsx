import { Clock, MapPin } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { Separator } from "@/components/ui/separator"
import { getDefaultLocation } from "@/server/actions/location/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import HoursForm from "@/app/dashboard/settings/locations/hours-form"
import LocationForm from "@/app/dashboard/settings/locations/location-form"

export const metadata: Metadata = {
  title: "Sucursal"
}

export default async function LocationPage() {
  const [data, currentOrg] = await Promise.all([
    getDefaultLocation(),
    getCurrentOrganization()
  ])

  if (!currentOrg) {
    return notFound()
  }

  return (
    <div className="mx-auto max-w-2xl grow px-4 sm:px-0">
      <PageSubtitle
        title="Sucursal"
        description="Información de contacto"
        Icon={MapPin}
      />
      <LocationForm data={data} enabled />
      <Separator className="my-8" />
      <PageSubtitle
        title="Horarios de atención"
        description="Horarios de atención al público"
        Icon={Clock}
      />
      <HoursForm data={data} />
    </div>
  )
}
