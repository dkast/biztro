"use client"

import React, { useEffect } from "react"
import {
  flexRender,
  type ColumnDef,
  type Row,
  type Table as TanStackTable
} from "@tanstack/react-table"
import { SearchX } from "lucide-react"

import { EmptyState } from "@/components/dashboard/empty-state"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { useMobile } from "@/lib/use-mobile"
import { cn } from "@/lib/utils"
import { DataTablePagination } from "./data-table-pagination"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  toolbar?: React.ReactNode
  onRowClick?: (row: Row<TData>) => void
  table: TanStackTable<TData>
  globalFilter: string
  setGlobalFilter: (value: string) => void
  floatinToolbar?: React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  toolbar,
  onRowClick,
  table,
  globalFilter,
  setGlobalFilter,
  floatinToolbar
}: DataTableProps<TData, TValue>) {
  const isMobile = useMobile()

  useEffect(() => {
    // If isMobile is true, then we need to hide the columns that have the enableHidden prop to true
    if (isMobile) {
      table.getAllColumns().forEach(column => {
        if (column.columnDef.enableHiding) {
          column.toggleVisibility(false)
        }
      })
    } else {
      table.getAllColumns().forEach(column => {
        if (column.columnDef.enableHiding) {
          column.toggleVisibility(true)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile])

  return (
    <div>
      <div className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Buscar en resultados"
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className="h-8 w-[200px]"
        />
        {toolbar}
      </div>
      <div className="mb-4 overflow-hidden rounded-lg border dark:border-gray-800">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row)}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="py-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <EmptyState
                    icon={<SearchX />}
                    title="No se encontraron datos"
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {table.getFilteredSelectedRowModel().rows.length > 0 &&
          floatinToolbar && (
            <div className="fixed inset-x-0 bottom-6 z-10 mx-auto w-fit translate-x-1/2 rounded-full border bg-gray-800 px-1.5 py-1.5 text-white shadow-lg dark:border dark:border-gray-700 dark:bg-gray-900">
              {floatinToolbar}
            </div>
          )}
      </div>
    </div>
  )
}
