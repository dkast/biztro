import { notFound } from "next/navigation"

import Workbench from "@/components/menu-editor/workbench"
import { getCategoriesWithItems } from "@/server/actions/item/queries"
import { getDefaultLocation } from "@/server/actions/location/queries"
import { getMenuById } from "@/server/actions/menu/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"

export default async function MenuEditorPage({
  params
}: {
  params: { id: string }
}) {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg || !params?.id) {
    return notFound()
  }

  const categories = await getCategoriesWithItems()
  const location = await getDefaultLocation()
  const menu = await getMenuById(params.id)

  if (!menu) {
    return notFound()
  }

  return (
    <Workbench
      menu={menu}
      organization={currentOrg}
      location={location}
      categories={categories}
    />
  )
}
