"use client"

import type { Category } from "@prisma/client"
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs"

import { DataTableFilter } from "@/components/data-table/data-table-filter"
import { MenuItemStatus } from "@/lib/types"

const status = [
  {
    value: MenuItemStatus.ACTIVE,
    label: "Activo"
  },
  {
    value: MenuItemStatus.DRAFT,
    label: "Borrador"
  },
  {
    value: MenuItemStatus.ARCHIVED,
    label: "Archivado"
  }
]

export default function FilterToolbar({
  categories
}: {
  categories: Category[]
}) {
  const [categoryValue, setCategoryValue] = useQueryState(
    "category",
    parseAsArrayOf(parseAsString)
      .withOptions({
        shallow: false,
        throttleMs: 300
      })
      .withDefault([])
  )

  const [statusValue, setStatusValue] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString)
      .withOptions({
        shallow: false,
        throttleMs: 300
      })
      .withDefault([])
  )

  return (
    <div className="flex grow flex-row items-center gap-x-2">
      <DataTableFilter
        title="Estatus"
        options={status}
        value={statusValue}
        onChange={setStatusValue}
      />
      <DataTableFilter
        title="Categoría"
        options={categories?.map(d => ({ value: d.id, label: d.name })) ?? []}
        value={categoryValue}
        onChange={setCategoryValue}
      />
    </div>
  )
}
