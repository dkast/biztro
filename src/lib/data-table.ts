import { rankItem, type RankingInfo } from "@tanstack/match-sorter-utils"
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  constructFilterFn,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  metaHelper,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  type ColumnDef,
  type Row,
  type RowData,
  type useTable
} from "@tanstack/react-table"

const fuzzyFilter = constructFilterFn({
  filter: (dataValue, filterValue, _row, _columnId, addMeta) => {
    const itemRank = rankItem(dataValue, String(filterValue))
    addMeta?.({ itemRank })
    return itemRank.passed
  }
})

export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { fuzzy: fuzzyFilter },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text
  },
  filterMeta: metaHelper<{ itemRank: RankingInfo }>()
})

export type DataTableColumnDef<
  TData extends RowData,
  TValue = unknown
> = ColumnDef<typeof dataTableFeatures, TData, TValue>

export type DataTableInstance<TData extends RowData> = ReturnType<
  typeof useTable<typeof dataTableFeatures, TData>
>

export type DataTableRow<TData extends RowData> = Row<
  typeof dataTableFeatures,
  TData
>

export type { RowData }
