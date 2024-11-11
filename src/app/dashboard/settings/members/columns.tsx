"use client"

import { useState } from "react"
import { type Membership } from "@prisma/client"
import { type ColumnDef, type Row } from "@tanstack/react-table"
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  MoreHorizontal
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import MemberDeactivate from "@/app/dashboard/settings/members/member-deactivate"
import MemberDelete from "@/app/dashboard/settings/members/member-delete"
import { MembershipRole } from "@/lib/types"

export const columns: ColumnDef<Membership>[] = [
  {
    accessorKey: "user.name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
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
    accessorKey: "user.email",
    header: "Correo electrónico",
    enableHiding: true
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
      const membership = row.original
      const roleLabel = (() => {
        switch (membership.role) {
          case MembershipRole.ADMIN:
            return "Administrador"
          case MembershipRole.MEMBER:
            return "Miembro"
          case MembershipRole.OWNER:
            return "Propietario"
          default:
            return ""
        }
      })()

      return (
        <div className="flex gap-y-1 sm:flex-col">
          <span className="text-sm">{roleLabel}</span>
          <div className="sm:hidden">
            <Badge variant={membership.isActive ? "green" : "secondary"}>
              {membership.isActive ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "isActive",
    header: "Estado",
    cell: ({ row }) => {
      const membership = row.original

      return (
        <Badge variant={membership.isActive ? "green" : "secondary"}>
          {membership.isActive ? "Activo" : "Inactivo"}
        </Badge>
      )
    },
    enableHiding: true
  },
  {
    id: "actions",
    cell: ActionsColumn
  }
]

function ActionsColumn({ row }: { row: Row<Membership> }) {
  const membership = row.original
  const [openDelete, setOpenDelete] = useState(false)
  const [openDeactivate, setOpenDeactivate] = useState(false)

  if (
    membership.role === MembershipRole.OWNER ||
    membership.role === MembershipRole.ADMIN
  ) {
    return null
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="hover:bg-gray-100">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setOpenDeactivate(true)
            }}
          >
            <span>Desactivar</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setOpenDelete(true)
            }}
          >
            <span className="text-red-500">Eliminar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <MemberDeactivate
        open={openDeactivate}
        setOpen={setOpenDeactivate}
        member={membership}
      />
      <MemberDelete
        open={openDelete}
        setOpen={setOpenDelete}
        member={membership}
      />
    </>
  )
}
