import { renderToStaticMarkup } from "react-dom/server"
import { NuqsTestingAdapter } from "nuqs/adapters/testing"
import { describe, expect, it } from "vitest"

import { useDataGrid } from "@/hooks/use-data-grid"
import { useDataTable } from "@/hooks/use-data-table"
import type { ColumnDef } from "@/lib/types/tanstack-table"

interface Person {
  id: string
  name: string
}

const data: Person[] = [
  { id: "2", name: "Beta" },
  { id: "1", name: "Alpha" },
  { id: "3", name: "Gamma" }
]

const columns: ColumnDef<Person>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
    meta: {
      label: "Nombre",
      cell: { variant: "short-text" }
    }
  }
]

describe("TanStack Table v9 legacy bridge", () => {
  it("constructs the simple table with fuzzy filtering and pagination", () => {
    function Probe() {
      const { table, globalFilter } = useDataTable({ data, columns })

      return (
        <output
          data-filter={globalFilter}
          data-page-count={table.getPageCount()}
          data-can-sort={table.getColumn("name")?.getCanSort()}
        >
          {table
            .getRowModel()
            .rows.map(row => row.original.name)
            .join(",")}
        </output>
      )
    }

    const html = renderToStaticMarkup(
      <NuqsTestingAdapter searchParams="?q=alp">
        <Probe />
      </NuqsTestingAdapter>
    )

    expect(html).toContain('data-filter="alp"')
    expect(html).toContain('data-page-count="1"')
    expect(html).toContain('data-can-sort="true"')
    expect(html).toContain(">Alpha</output>")
  })

  it("constructs the data grid with controlled filtering, sorting, and selection", () => {
    function Probe() {
      const { table } = useDataGrid({
        data,
        columns,
        getRowId: row => row.id,
        initialState: {
          columnFilters: [
            {
              id: "name",
              value: { operator: "contains", value: "a" }
            }
          ],
          rowSelection: { "1": true },
          sorting: [{ id: "name", desc: false }]
        }
      })

      return (
        <output
          data-filter-count={table.getState().columnFilters.length}
          data-selected={table.getSelectedRowModel().rows[0]?.id}
          data-sort={table.getState().sorting[0]?.id}
        >
          {table
            .getRowModel()
            .rows.map(row => row.original.name)
            .join(",")}
        </output>
      )
    }

    const html = renderToStaticMarkup(<Probe />)

    expect(html).toContain('data-filter-count="1"')
    expect(html).toContain('data-selected="1"')
    expect(html).toContain('data-sort="name"')
    expect(html).toContain(">Alpha,Beta,Gamma</output>")
  })
})
