"use client"

import { useDataTable } from "@/hooks/use-data-table"
import type { Prisma } from "@prisma/client"

import { DataTable } from "@/components/data-table/data-table"
import type { getMembers } from "@/server/actions/user/queries"
import { columns } from "./columns"

export default function MemberTable({
  data
}: {
  data: Prisma.PromiseReturnType<typeof getMembers>
}) {
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
