import {
  dehydrate,
  HydrationBoundary,
  QueryClient
} from "@tanstack/react-query"
import { TriangleAlert } from "lucide-react"
import type { Metadata } from "next"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getCategories, getMenuItemById } from "@/server/actions/item/queries"
import ItemForm from "@/app/dashboard/menu-items/[action]/[id]/item-form"

export async function generateMetadata(props: {
  params: Promise<{ action: string; id: string }>
}): Promise<Metadata> {
  const params = await props.params
  const title = `${params.action === "new" ? "Crear" : "Editar"} Producto`
  return {
    title
  }
}

export default async function ItemPage(props: {
  params: Promise<{ action: string; id: string }>
}) {
  const params = await props.params
  const item = await getMenuItemById(params.id)

  if (!item) {
    return (
      <div className="mx-auto max-w-2xl grow px-4 sm:px-6">
        <Alert variant="warning">
          <TriangleAlert className="size-4" />
          <AlertTitle>Producto no encontrado</AlertTitle>
          <AlertDescription>
            El producto que buscas no existe o fue eliminado
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(item.organizationId)
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="mx-auto max-w-236 grow px-4 sm:px-6">
        <ItemForm action={params.action} item={item} />
      </div>
    </HydrationBoundary>
  )
}
