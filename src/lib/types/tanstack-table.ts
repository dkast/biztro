import type {
  RowData,
  Cell as TanStackCell,
  Column as TanStackColumn,
  ColumnDef as TanStackColumnDef,
  FilterFn as TanStackFilterFn,
  Header as TanStackHeader,
  Row as TanStackRow,
  TableMeta as TanStackTableMeta,
  TableState as TanStackTableState
} from "@tanstack/react-table"
import type {
  LegacyFeatures,
  LegacyReactTable,
  LegacyTableOptions
} from "@tanstack/react-table/legacy"

// TODO(tanstack-v9): Remove this bridge after the Dice UI data grid migrates.
export type Table<TData extends RowData> = LegacyReactTable<TData>
export type TableOptions<TData extends RowData> = LegacyTableOptions<TData>
export type TableState = TanStackTableState<LegacyFeatures>
export type ColumnDef<
  TData extends RowData,
  TValue = unknown
> = TanStackColumnDef<LegacyFeatures, TData, TValue>
export type Column<TData extends RowData, TValue = unknown> = TanStackColumn<
  LegacyFeatures,
  TData,
  TValue
>
export type Row<TData extends RowData> = TanStackRow<LegacyFeatures, TData>
export type Cell<TData extends RowData, TValue = unknown> = TanStackCell<
  LegacyFeatures,
  TData,
  TValue
>
export type Header<TData extends RowData, TValue = unknown> = TanStackHeader<
  LegacyFeatures,
  TData,
  TValue
>
export type TableMeta<TData extends RowData> = TanStackTableMeta<
  LegacyFeatures,
  TData
>
export type FilterFn<TData extends RowData> = TanStackFilterFn<
  LegacyFeatures,
  TData
>
export type { RowData }
