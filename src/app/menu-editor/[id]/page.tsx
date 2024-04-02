import { notFound } from "next/navigation"

import Workbench from "@/components/menu-editor/workbench"
import { getCurrentOrganization } from "@/server/actions/user/queries"

export default async function MenuEditorPage() {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    return notFound()
  }

  return <Workbench organization={currentOrg} />
}
