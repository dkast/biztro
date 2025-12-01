"use client"

import { useDataTable } from "@/hooks/use-data-table"
import type { Category } from "@/generated/prisma-client/client"

import { DataTable } from "@/components/data-table/data-table"
import { columns } from "./columns"

export default function CategoryTable({ data }: { data: Category[] }) {
  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data,
    columns
  })

  return (
    <DataTable
      columns={columns}
      table={table}
      globalFilter={globalFilter}
      setGlobalFilter={setGlobalFilter}
    />
  )
}
