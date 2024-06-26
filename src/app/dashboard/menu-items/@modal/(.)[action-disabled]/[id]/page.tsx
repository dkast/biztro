import { TriangleAlert } from "lucide-react"

import Panel from "@/components/dashboard/page-panel"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import ItemForm from "@/app/dashboard/menu-items/[action]/[id]/item-form"
import { getCategories, getMenuItemById } from "@/server/actions/item/queries"

export default async function ItemPage({
  params
}: {
  params: { action: string; id: string }
}) {
  const item = await getMenuItemById(params.id)
  const categories = await getCategories()

  if (!item) {
    return (
      <Panel className="rounded-lg sm:m-2 sm:h-[95%]">
        <div className="overflow-x-auto">
          <Alert variant="warning">
            <TriangleAlert className="size-4" />
            <AlertTitle>Producto no encontrado</AlertTitle>
            <AlertDescription>
              El producto que buscas no existe o fue eliminado
            </AlertDescription>
          </Alert>
        </div>
      </Panel>
    )
  }

  return (
    <Panel className="rounded-lg sm:m-2 sm:h-[95%]">
      <div className="mx-auto h-full max-w-2xl overflow-x-auto px-4 sm:px-6">
        <ItemForm action={params.action} item={item} categories={categories} />
      </div>
    </Panel>
  )
}
