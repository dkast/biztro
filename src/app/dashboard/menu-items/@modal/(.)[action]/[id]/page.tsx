import { Suspense } from "react"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient
} from "@tanstack/react-query"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import Panel from "@/components/dashboard/page-panel"
import { Skeleton } from "@/components/ui/skeleton"
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
      <Panel className="rounded-lg sm:m-2 sm:h-[95%]">
        <div className="h-full overflow-x-auto">
          <div className="max-w-236 px-4 py-2 sm:mx-auto sm:px-6">
            <Suspense fallback={<LoadingItemSkeleton />}>
              <ItemForm action={params.action} promiseItem={item} />
            </Suspense>
          </div>
        </div>
      </Panel>
    </HydrationBoundary>
  )
}

function LoadingItemSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-3/4" />
    </div>
  )
}
