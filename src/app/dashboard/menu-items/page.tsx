import { ShoppingBag } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import ItemCreate from "@/app/dashboard/menu-items/item-create"
import ItemTable from "@/app/dashboard/menu-items/item-table"
import { getCategories, getMenuItems } from "@/server/actions/item/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import type { MenuItemQueryFilter } from "@/lib/types"

export const metadata: Metadata = {
  title: "Productos"
}

export default async function ItemsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    notFound()
  }

  const categories = await getCategories()
  const filter: MenuItemQueryFilter = {}

  if (searchParams.status) {
    filter.status = searchParams.status as string
  }

  if (searchParams.category) {
    filter.category = searchParams.category as string
  }

  const data = await getMenuItems(filter)

  return (
    <div className="mx-auto grow px-4 sm:px-6">
      <PageSubtitle
        title="Productos"
        description="Administra los productos de tu menú"
        Icon={ShoppingBag}
      >
        <ItemCreate />
      </PageSubtitle>
      <div className="mt-6">
        <ItemTable data={data} categories={categories} />
      </div>
    </div>
  )
}
