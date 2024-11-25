"use client"

import { useDataTable } from "@/hooks/use-data-table"
import type { Prisma } from "@prisma/client"
import { useRouter } from "next/navigation"

import { DataTable } from "@/components/data-table/data-table"
import { columns } from "@/app/dashboard/menu-items/columns"
import FilterToolbar from "@/app/dashboard/menu-items/filter-toolbar"
import FloatingToolbar from "@/app/dashboard/menu-items/floating-toolbar"
import type { getCategories, getMenuItems } from "@/server/actions/item/queries"

export default function ItemTable({
  data,
  categories
}: {
  data: Prisma.PromiseReturnType<typeof getMenuItems>
  categories: Prisma.PromiseReturnType<typeof getCategories>
}) {
  const router = useRouter()
  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data,
    columns
  })

  return (
    <DataTable
      onRowClick={row => {
        router.push(`/dashboard/menu-items/edit/${row.original?.id}`)
      }}
      columns={columns}
      table={table}
      globalFilter={globalFilter}
      setGlobalFilter={setGlobalFilter}
      toolbar={<FilterToolbar categories={categories} />}
      floatinToolbar={<FloatingToolbar table={table} categories={categories} />}
    />
  )
}
