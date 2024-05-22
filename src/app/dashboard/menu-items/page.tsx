import { ShoppingBag } from "lucide-react"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { DataTable } from "@/components/data-table/data-table"
import { columns } from "@/app/dashboard/menu-items/columns"
import FilterToolbar from "@/app/dashboard/menu-items/filter-toolbar"
import ItemCreate from "@/app/dashboard/menu-items/item-create"
import { getCategories, getMenuItems } from "@/server/actions/item/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import type { MenuItemQueryFilter } from "@/lib/types"

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
        <DataTable
          columns={columns}
          data={data}
          toolbar={<FilterToolbar categories={categories} />}
        />
      </div>
    </div>
  )
}
