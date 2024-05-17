"use client"

import { useState } from "react"
import type { Menu } from "@prisma/client"
import { AnimatePresence, motion } from "framer-motion"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"

import { AlertDialog } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import MenuCreate from "@/app/dashboard/menu-create"
import MenuDelete from "@/app/dashboard/menu-delete"
import { MenuStatus } from "@/lib/types"

export default function MenuList({ menus }: { menus: Menu[] }) {
  return (
    <AnimatePresence mode="popLayout">
      {menus.map(menu => (
        <MenuCard key={menu.id} menu={menu} />
      ))}
      <motion.div
        layout
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 13, stiffness: 100 }}
      >
        <MenuCreate />
      </motion.div>
    </AnimatePresence>
  )
}

function MenuCard({ menu }: { menu: Menu }) {
  const [openDelete, setOpenDelete] = useState<boolean>(false)
  return (
    <motion.div
      layout
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring" }}
    >
      <Link href={`/menu-editor/${menu.id}`} prefetch={false}>
        <motion.div
          whileHover={{ y: -6 }}
          whileTap={{ scale: 0.98 }}
          className="flex h-[370px] items-center justify-center gap-4 rounded-lg bg-white shadow-lg"
        >
          <img
            src="safari-pinned-tab.svg"
            alt={menu.name}
            className="size-16 opacity-10"
          />
        </motion.div>
      </Link>
      <div className="flex flex-row justify-between gap-2 py-3">
        <h2>{menu.name}</h2>
        <div className="flex flex-row items-center gap-1">
          {(() => {
            switch (menu.status) {
              case MenuStatus.PUBLISHED:
                return (
                  <Badge variant="green" className="rounded-full">
                    Activo
                  </Badge>
                )
              case MenuStatus.DRAFT:
                return (
                  <Badge variant="violet" className="rounded-full">
                    Borrador
                  </Badge>
                )
              default:
                return null
            }
          })()}

          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-gray-700"
                >
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/menu-editor/${menu.id}`} prefetch={false}>
                    <span>Editar</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenDelete(true)}>
                  <span className="text-red-500">Eliminar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </AlertDialog>
          <MenuDelete menu={menu} open={openDelete} setOpen={setOpenDelete} />
        </div>
      </div>
    </motion.div>
  )
}
