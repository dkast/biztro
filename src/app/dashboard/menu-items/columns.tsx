"use client"

import { useState } from "react"
import type { Prisma } from "@prisma/client"
import type { ColumnDef, Row } from "@tanstack/react-table"
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  MoreHorizontal,
  Star
} from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import type { getMenuItemById } from "@/server/actions/item/queries"
import ItemDelete from "@/app/dashboard/menu-items/item-delete"
import { MenuItemStatus } from "@/lib/types"

export const columns: ColumnDef<
  Prisma.PromiseReturnType<typeof getMenuItemById>
>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={() => table.toggleAllPageRowsSelected()}
        aria-label="Selecciona todas las filas"
      />
    ),
    cell: ({ row }) => {
      return (
        <div onClick={e => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={() => row.toggleSelected()}
            aria-label="Selecciona fila"
            className="translate-y-0.5"
          />
        </div>
      )
    }
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Producto
          {{
            asc: <ChevronUp className="ml-2 h-4 w-4" />,
            desc: <ChevronDown className="ml-2 h-4 w-4" />
          }[column.getIsSorted() as string] ?? (
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      const item = row.original
      if (!item) return null
      return (
        <div className="flex items-center gap-2">
          <span>{item.name}</span>
          {item.featured && (
            <Star className="size-3 text-orange-400 dark:text-yellow-400" />
          )}
        </div>
      )
    }
  },
  {
    accessorKey: "description",
    header: "Descripción",
    enableHiding: true
  },
  {
    accessorKey: "category.name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Categoría
          {{
            asc: <ChevronUp className="ml-2 h-4 w-4" />,
            desc: <ChevronDown className="ml-2 h-4 w-4" />
          }[column.getIsSorted() as string] ?? (
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      )
    },
    enableHiding: true
  },
  {
    accessorKey: "status",
    header: "Estatus",
    enableHiding: true,
    enableSorting: false,
    meta: {
      className: "hidden md:table-cell"
    },
    cell: ({ row }) => {
      const item = row.original
      return (
        <>
          {(() => {
            switch (item?.status) {
              case MenuItemStatus.ACTIVE:
                return (
                  <Badge variant="green" className="rounded-full">
                    Activo
                  </Badge>
                )
              case MenuItemStatus.DRAFT:
                return (
                  <Badge variant="violet" className="rounded-full">
                    Borrador
                  </Badge>
                )
              case MenuItemStatus.ARCHIVED:
                return (
                  <Badge variant="secondary" className="rounded-full">
                    Archivado
                  </Badge>
                )
              default:
                return null
            }
          })()}
        </>
      )
    }
  },
  {
    accessorKey: "variants",
    header: "Precio",
    cell: ({ row }) => {
      const item = row.original
      if (!item?.variants) return null

      if (item?.variants.length > 1) {
        const prices = item.variants.map(variant => variant.price)
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)
        return (
          <>
            {minPrice.toLocaleString("es-MX", {
              style: "currency",
              currency: "MXN"
            })}{" "}
            -{" "}
            {maxPrice.toLocaleString("es-MX", {
              style: "currency",
              currency: "MXN"
            })}
          </>
        )
      } else if (item?.variants[0]?.price) {
        return (
          <>
            {item.variants[0].price.toLocaleString("es-MX", {
              style: "currency",
              currency: "MXN"
            })}
          </>
        )
      } else {
        return null
      }
    }
  },
  {
    id: "actions",
    cell: ActionsColumn
  }
]

function ActionsColumn({
  row
}: {
  row: Row<Prisma.PromiseReturnType<typeof getMenuItemById>>
}) {
  const item = row.original
  const [openDelete, setOpenDelete] = useState<boolean>(false)

  if (!item) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/menu-items/edit/${item.id}`}
              prefetch={false}
            >
              <span>Editar</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={event => {
              event.stopPropagation()
              setOpenDelete(true)
            }}
          >
            <span className="text-red-500">Eliminar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ItemDelete item={item} open={openDelete} setOpen={setOpenDelete} />
    </>
  )
}
