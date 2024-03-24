import PageSubtitle from "@/components/dashboard/page-subtitle"
import { DataTable } from "@/components/data-table/data-table"
import { columns } from "@/app/dashboard/menu-items/columns"
import CreateItem from "@/app/dashboard/menu-items/create-item"
import { getMenuItems } from "@/server/actions/item/queries"

export default async function ItemsPage() {
  const data = await getMenuItems()

  return (
    <div className="mx-auto grow px-4 sm:px-6">
      <PageSubtitle
        title="Productos"
        description="Administra los productos de tu menú"
      >
        <CreateItem />
      </PageSubtitle>
      <div className="mt-6">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  )
}
