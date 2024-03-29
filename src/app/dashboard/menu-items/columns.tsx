"use client"

import { useState } from "react"
import type { MenuItem } from "@prisma/client"
import type { ColumnDef, Row } from "@tanstack/react-table"
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  MoreHorizontal
} from "lucide-react"
import Link from "next/link"

import { AlertDialog } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import ItemDelete from "@/app/dashboard/menu-items/item-delete"

export const columns: ColumnDef<MenuItem>[] = [
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
    }
  },
  {
    accessorKey: "description",
    header: "Descripción",
    enableHiding: true
  },
  {
    id: "actions",
    cell: ActionsColumn
  }
]

function ActionsColumn({ row }: { row: Row<MenuItem> }) {
  const item = row.original
  const [openDelete, setOpenDelete] = useState<boolean>(false)

  return (
    <>
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/menu-items/edit/${item.id}`}>
                <>
                  <span>Editar</span>
                </>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpenDelete(true)}>
              <span className="text-red-500">Eliminar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </AlertDialog>
      <ItemDelete item={item} open={openDelete} setOpen={setOpenDelete} />
    </>
  )
}
