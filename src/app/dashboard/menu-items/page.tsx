import { ShoppingBag } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { getCategories, getMenuItems } from "@/server/actions/item/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import ItemCreate from "@/app/dashboard/menu-items/item-create"
import ItemImport from "@/app/dashboard/menu-items/item-import"
import ItemTable from "@/app/dashboard/menu-items/item-table"
import type { MenuItemQueryFilter } from "@/lib/types"

export const metadata: Metadata = {
  title: "Productos"
}

export default async function ItemsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [searchParams, currentOrg] = await Promise.all([
    props.searchParams,
    getCurrentOrganization()
  ])

  if (!currentOrg) {
    notFound()
  }

  const filter: MenuItemQueryFilter = {}

  if (searchParams.status) {
    filter.status = searchParams.status as string
  }

  if (searchParams.category) {
    filter.category = searchParams.category as string
  }

  const data = await getMenuItems(filter, currentOrg.id)
  const categories = await getCategories(currentOrg.id)

  return (
    <div className="mx-auto grow px-4 sm:px-6">
      <PageSubtitle>
        <PageSubtitle.Icon icon={ShoppingBag} />
        <PageSubtitle.Title>Productos</PageSubtitle.Title>
        <PageSubtitle.Description>
          Administra los productos de tu menú
        </PageSubtitle.Description>
        <PageSubtitle.Actions>
          <div className="flex gap-2">
            <ItemImport />
            <ItemCreate />
          </div>
        </PageSubtitle.Actions>
      </PageSubtitle>
      <div className="mt-6">
        <ItemTable data={data} categories={categories} />
      </div>
    </div>
  )
}
