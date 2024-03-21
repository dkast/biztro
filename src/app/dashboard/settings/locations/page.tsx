import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import LocationForm from "@/app/dashboard/settings/locations/location-form"
import { getDefaultLocation } from "@/server/actions/location/queries"

export default async function LocationPage() {
  const data = await getDefaultLocation()

  return (
    <div className="mx-auto max-w-2xl grow px-4 sm:px-0">
      <PageSubtitle title="Sucursal" description="Información de contacto" />
      <LocationForm data={data} enabled />
    </div>
  )
}
