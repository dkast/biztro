import { notFound } from "next/navigation"

import Workbench from "@/components/menu-editor/workbench"
import { getCategoriesWithItems } from "@/server/actions/item/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"

export default async function MenuEditorPage() {
  const currentOrg = await getCurrentOrganization()
  const categoryData = await getCategoriesWithItems()

  if (!currentOrg) {
    return notFound()
  }

  console.dir(categoryData)

  return <Workbench organization={currentOrg} categoryData={categoryData} />
}
