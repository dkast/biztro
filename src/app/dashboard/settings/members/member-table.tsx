"use client"

import { DataTable } from "@/components/data-table/data-table"
import { useDataTable } from "@/hooks/use-data-table"
import type { AuthMember } from "@/lib/auth"
import { columns } from "./columns"

export default function MemberTable({ data }: { data: AuthMember[] }) {
  console.dir(data)

  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: data,
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
