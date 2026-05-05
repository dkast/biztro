import {
  dehydrate,
  HydrationBoundary,
  QueryClient
} from "@tanstack/react-query"
import { notFound } from "next/navigation"

import { getCategories, getMenuItemById } from "@/server/actions/item/queries"
import { getAvailableTranslations } from "@/server/actions/item/translations"
import {
  getCurrentOrganization,
  isProMember
} from "@/server/actions/user/queries"
import ItemForm from "@/app/dashboard/menu-items/[action]/[id]/item-form"

export async function ItemFormContent({
  action,
  id
}: {
  action: string
  id: string
}) {
  const org = await getCurrentOrganization()

  if (!org) {
    notFound()
  }

  const queryClient = new QueryClient()

  const [item, isPro, availableTranslations] = await Promise.all([
    getMenuItemById(id),
    isProMember(),
    getAvailableTranslations(org.id),
    queryClient.prefetchQuery({
      queryKey: ["categories"],
      queryFn: () => getCategories(org.id)
    })
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ItemForm
        action={action}
        item={item}
        isPro={isPro}
        availableTranslationLocales={availableTranslations.map(
          translation => translation.locale
        )}
      />
    </HydrationBoundary>
  )
}
