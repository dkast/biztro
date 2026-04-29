import {
  dehydrate,
  HydrationBoundary,
  QueryClient
} from "@tanstack/react-query"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategories, getMenuItemById } from "@/server/actions/item/queries"
import { getAvailableTranslations } from "@/server/actions/item/translations"
import {
  getCurrentOrganization,
  isProMember
} from "@/server/actions/user/queries"
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

  const [isPro, availableTranslations] = await Promise.all([
    isProMember(),
    getAvailableTranslations(org.id)
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div
        className="mx-auto w-full max-w-6xl grow px-4 py-6 sm:px-6 sm:py-8
          lg:px-8"
      >
        <ItemForm
          action={params.action}
          promiseItem={item}
          isPro={isPro}
          availableTranslationLocales={availableTranslations.map(
            translation => translation.locale
          )}
        />
      </div>
    </HydrationBoundary>
  )
}
