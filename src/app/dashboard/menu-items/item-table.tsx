"use client"

import type { Prisma } from "@prisma/client"
import { useRouter } from "next/navigation"

import { DataTable } from "@/components/data-table/data-table"
import { columns } from "@/app/dashboard/menu-items/columns"
import FilterToolbar from "@/app/dashboard/menu-items/filter-toolbar"
import type { getCategories, getMenuItems } from "@/server/actions/item/queries"

export default function ItemTable({
  data,
  categories
}: {
  data: Prisma.PromiseReturnType<typeof getMenuItems>
  categories: Prisma.PromiseReturnType<typeof getCategories>
}) {
  const router = useRouter()

  return (
    <DataTable
      onRowClick={row => {
        router.push(`/dashboard/menu-items/edit/${row.original?.id}`)
      }}
      columns={columns}
      data={data}
      toolbar={<FilterToolbar categories={categories} />}
    />
  )
}
