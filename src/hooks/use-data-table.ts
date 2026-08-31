import { useState } from "react"
import type { SortingState } from "@tanstack/react-table"
import { useTable } from "@tanstack/react-table"
import { debounce, parseAsString, useQueryState } from "nuqs"

import {
  dataTableFeatures,
  type DataTableColumnDef,
  type RowData
} from "@/lib/data-table"

const globalFilterQuery = parseAsString.withDefault("").withOptions({
  limitUrlUpdates: debounce(300)
})

export function useDataTable<TData extends RowData>({
  data,
  columns
}: {
  data: TData[]
  columns: DataTableColumnDef<TData>[]
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useQueryState("q", globalFilterQuery)

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "fuzzy",
    state: {
      sorting,
      globalFilter
    }
  })

  return { table, globalFilter, setGlobalFilter }
}
