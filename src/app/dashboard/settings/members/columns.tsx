"use client"

import { useState } from "react"
import { type ColumnDef, type Row } from "@tanstack/react-table"
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  MoreHorizontal
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import MemberDelete from "@/app/dashboard/settings/members/member-delete"
import type { AuthMember } from "@/lib/auth"

export function getColumns(canDeleteMember: boolean): ColumnDef<AuthMember>[] {
  return [
    {
      accessorKey: "user.name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Usuario
          {{
            asc: <ChevronUp className="ml-2 h-4 w-4" />,
            desc: <ChevronDown className="ml-2 h-4 w-4" />
          }[column.getIsSorted() as string] ?? (
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => {
        const m = row.original
        const name = m.user?.name ?? m.user?.email ?? "Usuario"
        const email = m.user?.email ?? ""
        const initials = name
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map(w => w[0]?.toUpperCase() ?? "")
          .join("")

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={m.user?.image ?? undefined} alt={name} />
              <AvatarFallback>{initials || "?"}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">{name}</span>
              {email && (
                <span className="text-muted-foreground truncate text-xs">
                  {email}
                </span>
              )}
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ row }) => {
        const role = row.original.role
        const label =
          role === "owner"
            ? "Propietario"
            : role === "admin"
              ? "Administrador"
              : "Miembro"
        return <span className="text-sm">{label}</span>
      }
    },
    {
      id: "actions",
      cell: props => {
        return (
          <ActionsColumn row={props.row} canDeleteMember={canDeleteMember} />
        )
      }
    }
  ]
}

function ActionsColumn({
  row,
  canDeleteMember
}: {
  row: Row<AuthMember>
  canDeleteMember: boolean
}) {
  const member = row.original
  const [openDelete, setOpenDelete] = useState(false)

  if (!canDeleteMember) return null

  if (member.role === "owner" || member.role === "admin") {
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
              setOpenDelete(true)
            }}
          >
            <span className="text-red-500">Remover</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <MemberDelete open={openDelete} setOpen={setOpenDelete} member={member} />
    </>
  )
}
