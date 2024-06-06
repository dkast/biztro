import { Layers } from "lucide-react"
import type { Metadata } from "next"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import CategoryEdit from "@/app/dashboard/menu-items/categories/category-edit"
import { columns } from "@/app/dashboard/menu-items/categories/columns"
import { getCategories } from "@/server/actions/item/queries"
import { ActionType } from "@/lib/types"

export const metadata: Metadata = {
  title: "Categorías"
}

export default async function CategoriesPage() {
  const data = await getCategories()
  return (
    <div className="mx-auto grow px-4 sm:px-6">
      <PageSubtitle
        title="Categorías"
        description="Administra las categorías de tu menú"
        Icon={Layers}
      >
        <CategoryEdit action={ActionType.CREATE}>
          <Button>Agregar categoría</Button>
        </CategoryEdit>
      </PageSubtitle>
      <div className="mt-6">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  )
}
