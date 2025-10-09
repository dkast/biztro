import { Layers } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { Button } from "@/components/ui/button"
import { getCategories } from "@/server/actions/item/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import CategoryEdit from "@/app/dashboard/menu-items/categories/category-edit"
import CategoryTable from "@/app/dashboard/menu-items/categories/category-table"
import { ActionType } from "@/lib/types"

export const metadata: Metadata = {
  title: "Categorías"
}

export default async function CategoriesPage() {
  const [currentOrg, data] = await Promise.all([
    getCurrentOrganization(),
    getCategories()
  ])

  if (!currentOrg) {
    notFound()
  }

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
        <CategoryTable data={data} />
      </div>
    </div>
  )
}
