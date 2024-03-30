"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs"

import { DataTableFilter } from "@/components/data-table/data-table-filter"
import { getCategories } from "@/server/actions/item/queries"
import { MenuStatus } from "@/lib/types"

const status = [
  {
    value: MenuStatus.ACTIVE,
    label: "Activo"
  },
  {
    value: MenuStatus.DRAFT,
    label: "Borrador"
  },
  {
    value: MenuStatus.ARCHIVED,
    label: "Archivado"
  }
]

export default function FilterToolbar() {
  const { data } = useSuspenseQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories()
  })

  const [categoryValue, setCategoryValue] = useQueryState(
    "category",
    parseAsArrayOf(parseAsString)
      .withOptions({
        shallow: false
      })
      .withDefault([])
  )

  const [statusValue, setStatusValue] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString)
      .withOptions({
        shallow: false
      })
      .withDefault([])
  )

  return (
    <>
      <div className="flex grow flex-row items-center gap-x-2">
        <DataTableFilter
          title="Estatus"
          options={status}
          value={statusValue}
          onChange={setStatusValue}
        />
        <DataTableFilter
          title="Categoría"
          options={data?.map(d => ({ value: d.id, label: d.name })) ?? []}
          value={categoryValue}
          onChange={setCategoryValue}
        />
      </div>
    </>
  )
}
