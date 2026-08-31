import { useState } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import {
  constructTable,
  tableFeatures,
  type ColumnDef
} from "@tanstack/react-table"
import { storeReactivityBindings } from "@tanstack/table-core/store-reactivity-bindings"
import { NuqsTestingAdapter } from "nuqs/adapters/testing"
import { describe, expect, it, vi } from "vitest"

import { DataTable } from "@/components/data-table/data-table"
import { useDataTable } from "@/hooks/use-data-table"
import { dataTableFeatures, type DataTableColumnDef } from "@/lib/data-table"

vi.mock("@/lib/utils", () => ({
  cn: (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" ")
}))

interface Person {
  id: string
  name: string
}

const data: Person[] = [
  { id: "2", name: "Beta" },
  { id: "1", name: "Alpha" },
  { id: "3", name: "Gamma" }
]

const columns: DataTableColumnDef<Person>[] = [
  {
    accessorKey: "name",
    header: "Nombre"
  }
]

const testFeatures = tableFeatures({
  coreReactivityFeature: storeReactivityBindings(),
  ...dataTableFeatures
})

const testColumns: ColumnDef<typeof testFeatures, Person>[] = [
  {
    accessorKey: "name",
    header: "Nombre"
  }
]

describe("useDataTable", () => {
  it("applies fuzzy global search and renders the shared table contract", () => {
    function Probe() {
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

    const html = renderToStaticMarkup(
      <NuqsTestingAdapter searchParams="?q=alp">
        <Probe />
      </NuqsTestingAdapter>
    )

    expect(html).toContain('value="alp"')
    expect(html).toContain("Nombre")
    expect(html).toContain("Alpha")
    expect(html).not.toContain(">Beta<")
    expect(html).toContain("1 registro(s) encontrado(s)")
    expect(html).toContain("Página 1 de 1")
  })

  it("sorts and paginates with native v9 row models", () => {
    const table = constructTable({
      features: testFeatures,
      columns: testColumns,
      data,
      initialState: {
        pagination: { pageIndex: 1, pageSize: 1 },
        sorting: [{ id: "name", desc: false }]
      }
    })

    expect(table.getPageCount()).toBe(3)
    expect(table.getRowModel().rows.map(row => row.original.name)).toEqual([
      "Beta"
    ])

    table.setPageIndex(0)
    table.setSorting([{ id: "name", desc: true }])

    expect(table.getRowModel().rows.map(row => row.original.name)).toEqual([
      "Gamma"
    ])
  })

  it("keeps native feature state reactive through useDataTable", () => {
    function Probe() {
      const [hasUpdated, setHasUpdated] = useState(false)
      const { table } = useDataTable({ data, columns })

      if (!hasUpdated) {
        setHasUpdated(true)
        table.getColumn("name")?.toggleSorting(true)
        table.setPageSize(1)
        table.setPageIndex(1)
        table.getColumn("name")?.toggleVisibility(false)
        table.getCoreRowModel().rows[0]?.toggleSelected()
      }

      return (
        <output
          data-page-index={table.state.pagination.pageIndex}
          data-page-size={table.state.pagination.pageSize}
          data-selected={table.getFilteredSelectedRowModel().rows.length}
          data-sorting={table.state.sorting[0]?.id}
          data-visible-cells={
            table.getRowModel().rows[0]?.getVisibleCells().length
          }
        >
          {table.getRowModel().rows[0]?.original.name}
        </output>
      )
    }

    const html = renderToStaticMarkup(
      <NuqsTestingAdapter>
        <Probe />
      </NuqsTestingAdapter>
    )

    expect(html).toContain('data-page-index="1"')
    expect(html).toContain('data-page-size="1"')
    expect(html).toContain('data-selected="1"')
    expect(html).toContain('data-sorting="name"')
    expect(html).toContain('data-visible-cells="0"')
    expect(html).toContain(">Beta</output>")
  })

  it("writes global search changes through the nuqs adapter", async () => {
    const onUrlUpdate = vi.fn()
    let updateGlobalFilter:
      ((value: string) => Promise<URLSearchParams>) | undefined

    function Probe() {
      const { setGlobalFilter } = useDataTable({ data, columns })
      updateGlobalFilter = setGlobalFilter
      return null
    }

    renderToStaticMarkup(
      <NuqsTestingAdapter onUrlUpdate={onUrlUpdate}>
        <Probe />
      </NuqsTestingAdapter>
    )

    await updateGlobalFilter?.("beta")

    expect(onUrlUpdate).toHaveBeenCalledOnce()
    expect(onUrlUpdate.mock.calls[0]?.[0].queryString).toBe("?q=beta")
  })
})
