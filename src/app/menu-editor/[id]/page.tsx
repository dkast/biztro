import {
  dehydrate,
  HydrationBoundary,
  QueryClient
} from "@tanstack/react-query"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"

import Workbench from "@/components/menu-editor/workbench"
import {
  getCategoriesWithItems,
  getFeaturedItems,
  getMenuItemsWithoutCategory
} from "@/server/actions/item/queries"
import { getDefaultLocation } from "@/server/actions/location/queries"
import { getMenuById, getThemes } from "@/server/actions/menu/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const params = await props.params
  const menu = await getMenuById(params.id)

  if (menu) {
    return {
      title: menu.name
    }
  } else {
    return {
      title: "Menú no encontrado"
    }
  }
}

export default async function MenuEditorPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["themes"],
    queryFn: () => getThemes({ themeType: "COLOR" })
  })

  const currentOrg = await getCurrentOrganization()

  if (!currentOrg || !params?.id) {
    return notFound()
  }

  const [categories, soloItems, location, featuredItems, menu] =
    await Promise.all([
      getCategoriesWithItems(),
      getMenuItemsWithoutCategory(),
      getDefaultLocation(currentOrg.id),
      getFeaturedItems(),
      getMenuById(params.id)
    ])

  if (!menu || !currentOrg) {
    return notFound()
  }

  // Read saved layout from cookies for SSR
  const cookieStore = await cookies()
  const layoutCookie = cookieStore.get("react-resizable-panels:layout:menu-editor-workbench")
  const defaultLayout = layoutCookie?.value
    ? JSON.parse(layoutCookie.value)
    : undefined

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Workbench
        menu={menu}
        organization={currentOrg}
        location={location}
        categories={categories}
        soloItems={soloItems}
        featuredItems={featuredItems}
        defaultLayout={defaultLayout}
      />
    </HydrationBoundary>
  )
}
