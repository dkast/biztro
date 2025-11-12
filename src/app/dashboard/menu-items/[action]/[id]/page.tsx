import {
  dehydrate,
  HydrationBoundary,
  QueryClient
} from "@tanstack/react-query"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategories, getMenuItemById } from "@/server/actions/item/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"
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
  const org = await getCurrentOrganization()

  if (!org) {
    return notFound()
  }
  const item = getMenuItemById(params.id)

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(org.id)
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="mx-auto max-w-4xl grow px-4 sm:px-6">
        <ItemForm action={params.action} promiseItem={item} />
      </div>
    </HydrationBoundary>
  )
}
