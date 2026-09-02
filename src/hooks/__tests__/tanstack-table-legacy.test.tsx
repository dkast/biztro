import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { useDataGrid } from "@/hooks/use-data-grid"
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
