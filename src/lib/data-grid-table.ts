import type { DataGridColumnMeta, DataGridTableMeta } from "@/types/data-grid"
import {
  columnFilteringFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createSortedRowModel,
  metaHelper,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  type CellData,
  type RowData,
  type Cell as TanStackCell,
  type Column as TanStackColumn,
  type ColumnDef as TanStackColumnDef,
  type FilterFn as TanStackFilterFn,
  type Header as TanStackHeader,
  type Row as TanStackRow,
  type TableOptions as TanStackTableOptions,
  type TableState as TanStackTableState,
  type useTable
} from "@tanstack/react-table"

export function createDataGridFeatures<TData extends RowData>() {
  return tableFeatures({
    columnSizingFeature,
    columnResizingFeature,
    columnOrderingFeature,
    columnPinningFeature,
    columnVisibilityFeature,
    columnFilteringFeature,
    filteredRowModel: createFilteredRowModel(),
    rowSortingFeature,
    sortedRowModel: createSortedRowModel(),
    sortFns: {
      alphanumeric: sortFn_alphanumeric,
      datetime: sortFn_datetime,
      text: sortFn_text
    },
    rowSelectionFeature,
    columnMeta: metaHelper<DataGridColumnMeta<TData>>(),
    tableMeta: metaHelper<DataGridTableMeta<TData>>()
  })
}

export type DataGridFeatures<TData extends RowData> = ReturnType<
  typeof createDataGridFeatures<TData>
>

export type Table<TData extends RowData> = ReturnType<
  typeof useTable<DataGridFeatures<TData>, TData>
>

export type TableOptions<TData extends RowData> = TanStackTableOptions<
  DataGridFeatures<TData>,
  TData
>

export type TableState<TData extends RowData> = TanStackTableState<
  DataGridFeatures<TData>
>

export type ColumnDef<
  TData extends RowData,
  TValue extends CellData = CellData
> = TanStackColumnDef<DataGridFeatures<TData>, TData, TValue>

export type Column<
  TData extends RowData,
  TValue extends CellData = CellData
> = TanStackColumn<DataGridFeatures<TData>, TData, TValue>

export type Row<TData extends RowData> = TanStackRow<
  DataGridFeatures<TData>,
  TData
>

export type Cell<
  TData extends RowData,
  TValue extends CellData = CellData
> = TanStackCell<DataGridFeatures<TData>, TData, TValue>

export type Header<
  TData extends RowData,
  TValue extends CellData = CellData
> = TanStackHeader<DataGridFeatures<TData>, TData, TValue>

export type TableMeta<TData extends RowData> = DataGridTableMeta<TData>

export type FilterFn<TData extends RowData> = TanStackFilterFn<
  DataGridFeatures<TData>,
  TData
>

export type { RowData }
