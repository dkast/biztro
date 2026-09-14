import { useState, type MouseEvent as ReactMouseEvent } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import type { FileCellData } from "@/types/data-grid"
import {
  constructTable,
  tableFeatures,
  type ColumnDef as TanStackColumnDef
} from "@tanstack/react-table"
import { storeReactivityBindings } from "@tanstack/table-core/store-reactivity-bindings"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DataGridCell } from "@/components/data-grid/data-grid-cell"
import { useDataGrid } from "@/hooks/use-data-grid"
import { createDataGridFeatures, type ColumnDef } from "@/lib/data-grid-table"

vi.mock("react-hot-toast", () => ({
  toast: Object.assign(vi.fn(), {
    error: vi.fn(),
    success: vi.fn()
  })
}))

vi.mock("@/lib/utils", () => ({
  cn: (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" ")
}))

interface GridRow {
  id: string
  name: string
  quantity: number
  active: boolean
  files: FileCellData[]
}

const menuFile: FileCellData = {
  id: "file-1",
  name: "menu.pdf",
  size: 1024,
  type: "application/pdf",
  url: "https://example.com/menu.pdf"
}

const data: GridRow[] = [
  {
    id: "2",
    name: "Beta",
    quantity: 2,
    active: true,
    files: []
  },
  {
    id: "1",
    name: "Alpha",
    quantity: 1,
    active: true,
    files: [menuFile]
  },
  {
    id: "3",
    name: "Gamma",
    quantity: 3,
    active: true,
    files: []
  }
]

const columns = [
  {
    accessorKey: "name",
    header: "Nombre",
    size: 180,
    meta: {
      label: "Nombre",
      cell: { variant: "short-text" as const }
    }
  },
  {
    accessorKey: "quantity",
    header: "Cantidad",
    size: 120,
    meta: {
      label: "Cantidad",
      cell: { variant: "number" as const }
    }
  },
  {
    accessorKey: "active",
    header: "Activo",
    size: 100,
    meta: {
      label: "Activo",
      cell: { variant: "checkbox" as const }
    }
  },
  {
    accessorKey: "files",
    header: "Archivos",
    size: 200,
    meta: {
      label: "Archivos",
      cell: {
        variant: "file" as const,
        multiple: true
      }
    }
  }
] satisfies ColumnDef<GridRow>[]

const nativeFeatures = tableFeatures({
  coreReactivityFeature: storeReactivityBindings(),
  ...createDataGridFeatures<GridRow>()
})

const nativeColumns: TanStackColumnDef<typeof nativeFeatures, GridRow>[] =
  columns

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

describe("useDataGrid", () => {
  it("constructs a native v9 table with the explicit grid feature set", () => {
    const table = constructTable({
      features: nativeFeatures,
      columns: nativeColumns,
      data,
      defaultColumn: {
        filterFn: (row, columnId, filterValue) => {
          const query = String(
            (filterValue as { value?: unknown }).value ?? ""
          ).toLowerCase()
          return String(row.getValue(columnId)).toLowerCase().includes(query)
        }
      },
      getRowId: row => row.id,
      initialState: {
        columnFilters: [
          {
            id: "name",
            value: { operator: "contains", value: "a" }
          }
        ],
        columnOrder: ["files", "name", "quantity", "active"],
        columnPinning: { start: ["name"], end: ["files"] },
        columnSizing: { name: 240 },
        columnVisibility: { active: false },
        rowSelection: { "2": true },
        sorting: [{ id: "name", desc: false }]
      }
    })

    expect(table.getRowModel().rows.map(row => row.original.name)).toEqual([
      "Alpha",
      "Beta",
      "Gamma"
    ])
    expect(table.getSelectedRowModel().rows[0]?.id).toBe("2")
    expect(
      table
        .getRowModel()
        .rows[0]?.getVisibleCells()
        .map(cell => cell.column.id)
    ).toEqual(["name", "quantity", "files"])

    const nameColumn = table.getColumn("name")
    const activeColumn = table.getColumn("active")
    const filesColumn = table.getColumn("files")
    const nameHeader = table
      .getFlatHeaders()
      .find(header => header.column.id === "name")

    expect(nameColumn?.getIsPinned()).toBe("start")
    expect(nameColumn?.getIsFirstColumn("start")).toBe(true)
    expect(nameColumn?.getSize()).toBe(240)
    expect(activeColumn?.getIsVisible()).toBe(false)
    expect(filesColumn?.getIsPinned()).toBe("end")
    expect(nameHeader?.getResizeHandler()).toEqual(expect.any(Function))

    activeColumn?.toggleVisibility(true)
    filesColumn?.pin(false)
    table.setColumnSizing(previous => ({ ...previous, name: 280 }))
    table.setColumnOrder(["name", "quantity", "active", "files"])
    table.setColumnFilters([
      {
        id: "name",
        value: { operator: "contains", value: "mm" }
      }
    ])

    expect(table.store.state.columnVisibility.active).toBe(true)
    expect(table.store.state.columnPinning.end).toEqual([])
    expect(table.store.state.columnSizing.name).toBe(280)
    expect(table.store.state.columnOrder).toEqual([
      "name",
      "quantity",
      "active",
      "files"
    ])
    expect(table.getRowModel().rows.map(row => row.original.name)).toEqual([
      "Gamma"
    ])

    table.setColumnFilters([])
    table.setSorting([{ id: "name", desc: true }])

    expect(table.getRowModel().rows.map(row => row.original.name)).toEqual([
      "Gamma",
      "Beta",
      "Alpha"
    ])
  })

  it("keeps controlled table state and virtualization aligned", () => {
    function Probe() {
      const [hasUpdated, setHasUpdated] = useState(false)
      const grid = useDataGrid({
        data,
        columns,
        getRowId: row => row.id
      })

      if (!hasUpdated) {
        setHasUpdated(true)
        grid.table.getColumn("name")?.toggleSorting(true)
        grid.table.getColumn("active")?.toggleVisibility(false)
        grid.table.getColumn("files")?.pin("end")
        grid.table.setColumnSizing({ name: 260 })
        grid.table.getCoreRowModel().rows[0]?.toggleSelected()
      }

      return (
        <output
          data-has-legacy-state={"getState" in grid.table}
          data-row-count={grid.table.getRowModel().rows.length}
          data-selected={grid.table.getSelectedRowModel().rows[0]?.id}
          data-sort={grid.table.state.sorting[0]?.id}
          data-sort-desc={grid.table.state.sorting[0]?.desc}
          data-visible={grid.table.getColumn("active")?.getIsVisible()}
          data-pinned={grid.table.getColumn("files")?.getIsPinned()}
          data-name-size={grid.table.getColumn("name")?.getSize()}
          data-virtual-size={grid.virtualTotalSize}
        >
          {grid.table
            .getRowModel()
            .rows.map(row => row.original.name)
            .join(",")}
        </output>
      )
    }

    const html = renderToStaticMarkup(<Probe />)

    expect(html).toContain('data-has-legacy-state="false"')
    expect(html).toContain('data-row-count="3"')
    expect(html).toContain('data-selected="2"')
    expect(html).toContain('data-sort="name"')
    expect(html).toContain('data-sort-desc="true"')
    expect(html).toContain('data-visible="false"')
    expect(html).toContain('data-pinned="end"')
    expect(html).toContain('data-name-size="260"')
    expect(html).toContain('data-virtual-size="108"')
    expect(html).toContain(">Gamma,Beta,Alpha</output>")
  })

  it("virtualizes the filtered row model rather than raw input data", () => {
    function Probe() {
      const grid = useDataGrid({
        data,
        columns,
        getRowId: row => row.id,
        initialState: {
          columnFilters: [
            {
              id: "name",
              value: { operator: "contains", value: "mm" }
            }
          ]
        }
      })

      return (
        <output
          data-row-count={grid.table.getRowModel().rows.length}
          data-virtual-size={grid.virtualTotalSize}
          data-virtual-items={grid.virtualItems.length}
        />
      )
    }

    const html = renderToStaticMarkup(<Probe />)

    expect(html).toContain('data-row-count="1"')
    expect(html).toContain('data-virtual-size="36"')
    expect(html).toContain('data-virtual-items="0"')
  })

  it("coordinates editing, search, paste, and file-cell paths", async () => {
    const pastedFile: FileCellData = {
      id: "file-2",
      name: "updated.pdf",
      size: 2048,
      type: "application/pdf"
    }
    const clipboard = {
      readText: vi
        .fn()
        .mockResolvedValue(`Delta\t42\ttrue\t${JSON.stringify([pastedFile])}`),
      writeText: vi.fn().mockResolvedValue(undefined)
    }
    const onDataChange = vi.fn()
    const onPaste = vi.fn()
    const onFilesUpload = vi.fn(() => Promise.resolve([pastedFile]))
    const onFilesDelete = vi.fn()

    vi.stubGlobal("navigator", { clipboard, userAgent: "Vitest" })
    vi.stubGlobal(
      "requestAnimationFrame",
      (callback: FrameRequestCallback): number => {
        const frameTimestamp: DOMHighResTimeStamp = 0
        callback(frameTimestamp)
        return 1
      }
    )
    vi.stubGlobal("cancelAnimationFrame", vi.fn())

    let grid: ReturnType<typeof useDataGrid<GridRow>> | undefined

    function Probe() {
      grid = useDataGrid({
        data,
        columns,
        getRowId: row => row.id,
        enablePaste: true,
        enableSearch: true,
        enableSingleCellSelection: true,
        onDataChange,
        onPaste,
        onFilesUpload,
        onFilesDelete
      })
      return null
    }

    renderToStaticMarkup(<Probe />)

    expect(grid).toBeDefined()
    if (!grid) throw new Error("Grid harness did not initialize")

    grid.tableMeta.onCellEditingStart?.(0, "name")
    expect(grid.tableMeta.focusedCell).toEqual({
      rowIndex: 0,
      columnId: "name"
    })
    expect(grid.tableMeta.editingCell).toEqual({
      rowIndex: 0,
      columnId: "name"
    })

    grid.tableMeta.onDataUpdate?.({
      rowIndex: 0,
      columnId: "name",
      value: "Edited"
    })
    expect(onDataChange.mock.calls[0]?.[0][0]?.name).toBe("Edited")

    grid.searchState?.onSearch("a")
    expect(grid.tableMeta.getIsSearchMatch?.(0, "name")).toBe(true)
    expect(grid.tableMeta.getIsActiveSearchMatch?.(0, "name")).toBe(true)

    grid.searchState?.onSearchOpenChange(true)
    grid.searchState?.onNavigateToNextMatch()
    expect(grid.tableMeta.getIsActiveSearchMatch?.(1, "name")).toBe(true)
    expect(grid.tableMeta.editingCell).toBeNull()

    const mouseEvent = {
      button: 0,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      preventDefault: vi.fn()
    } as unknown as ReactMouseEvent

    grid.tableMeta.onCellMouseDown?.(1, "files", mouseEvent)
    grid.tableMeta.onCellMouseUp?.()
    await grid.tableMeta.onCellsCopy?.()

    expect(clipboard.writeText).toHaveBeenCalledWith(JSON.stringify([menuFile]))

    const fileCell = grid.table
      .getRowModel()
      .rows[1]?.getVisibleCells()
      .find(cell => cell.column.id === "files")
    expect(fileCell).toBeDefined()

    if (fileCell) {
      const fileCellHtml = renderToStaticMarkup(
        <DataGridCell
          cell={fileCell}
          tableMeta={grid.tableMeta}
          rowIndex={1}
          columnId="files"
          rowHeight="short"
          isEditing={false}
          isFocused={false}
          isSelected={false}
          isSearchMatch={false}
          isActiveSearchMatch={false}
          readOnly={false}
        />
      )

      expect(fileCellHtml).toContain("menu.pdf")
    }

    await grid.tableMeta.onFilesUpload?.({
      files: [],
      rowIndex: 0,
      columnId: "files"
    })
    await grid.tableMeta.onFilesDelete?.({
      fileIds: [menuFile.id],
      rowIndex: 1,
      columnId: "files"
    })

    expect(onFilesUpload).toHaveBeenCalledOnce()
    expect(onFilesDelete).toHaveBeenCalledOnce()

    onDataChange.mockClear()
    grid.tableMeta.onCellEditingStart?.(0, "name")
    await grid.tableMeta.onCellsPaste?.()

    expect(onPaste).toHaveBeenCalledWith([
      { rowIndex: 0, columnId: "name", value: "Delta" },
      { rowIndex: 0, columnId: "quantity", value: 42 },
      { rowIndex: 0, columnId: "active", value: true },
      { rowIndex: 0, columnId: "files", value: [pastedFile] }
    ])
    expect(onDataChange.mock.calls[0]?.[0][0]).toMatchObject({
      name: "Delta",
      quantity: 42,
      active: true,
      files: [pastedFile]
    })
    expect(grid.tableMeta.getIsCellSelected?.(0, "files")).toBe(true)
  })
})
