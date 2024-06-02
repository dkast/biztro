"use client"

import type { Category } from "@prisma/client"
import type { ColumnDef } from "@tanstack/react-table"
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  Edit,
  Trash2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import CategoryDelete from "@/app/dashboard/menu-items/categories/category-delete"
import CategoryEdit from "@/app/dashboard/menu-items/categories/category-edit"
import { ActionType } from "@/lib/types"

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
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
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original
      return (
        <div className="flex justify-end gap-2">
          <CategoryEdit action={ActionType.UPDATE} category={category}>
            <Button variant="ghost" size="icon">
              <Edit className="size-4 text-gray-700" />
            </Button>
          </CategoryEdit>
          <CategoryDelete category={category}>
            <Button variant="ghost" size="icon">
              <Trash2 className="size-4 text-red-500" />
            </Button>
          </CategoryDelete>
        </div>
      )
    }
  }
]
