"use client"

import { DataTable } from "@/components/data-table/data-table"
import { useDataTable } from "@/hooks/use-data-table"
import type { AuthMember } from "@/lib/auth"
import { getColumns } from "./columns"

export default function MemberTable({
  data,
  canDeleteMember
}: {
  data: AuthMember[]
  canDeleteMember: boolean
}) {
  console.dir(data)

  const cols = getColumns(canDeleteMember)

  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: data,
    columns: cols
  })

  return (
    <DataTable
      columns={cols}
      table={table}
      globalFilter={globalFilter}
      setGlobalFilter={setGlobalFilter}
    />
  )
}
