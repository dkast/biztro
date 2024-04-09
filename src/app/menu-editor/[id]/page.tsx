import { notFound } from "next/navigation"

import Workbench from "@/components/menu-editor/workbench"
import { getCategoriesWithItems } from "@/server/actions/item/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"

export default async function MenuEditorPage({
  params
}: {
  params: { id: string }
}) {
  const currentOrg = await getCurrentOrganization()
  const categoryData = await getCategoriesWithItems()

  if (!currentOrg || !params?.id) {
    return notFound()
  }

  return (
    <Workbench
      menuId={params.id}
      organization={currentOrg}
      categoryData={categoryData}
    />
  )
}
