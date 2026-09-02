import { useState } from "react"
import { rankItem } from "@tanstack/match-sorter-utils"
import type { SortingState } from "@tanstack/react-table"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useLegacyTable
} from "@tanstack/react-table/legacy"
import { debounce, parseAsString, useQueryState } from "nuqs"

import type { ColumnDef, FilterFn, RowData } from "@/lib/types/tanstack-table"

const globalFilterQuery = parseAsString.withDefault("").withOptions({
  limitUrlUpdates: debounce(300)
})

// oxlint-disable-next-line typescript/no-explicit-any
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta?.({ itemRank })
  return itemRank.passed
}

export function useDataTable<TData extends RowData>({
  data,
  columns
}: {
  data: TData[]
  columns: ColumnDef<TData>[]
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useQueryState("q", globalFilterQuery)

  const table = useLegacyTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    getCoreRowModel: getCoreRowModel<TData>(),
    getPaginationRowModel: getPaginationRowModel<TData>(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getSortedRowModel: getSortedRowModel<TData>(),
    getFilteredRowModel: getFilteredRowModel<TData>(),
    state: {
      sorting,
      globalFilter
    }
  })

  return { table, globalFilter, setGlobalFilter }
}
