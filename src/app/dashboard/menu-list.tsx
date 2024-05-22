"use client"

import { useState } from "react"
import type { Menu } from "@prisma/client"
import { AnimatePresence, motion } from "framer-motion"
import { CircleCheck, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import gradient from "random-gradient"

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
      {menus.map((menu, index) => (
        <MenuCard key={menu.id} menu={menu} index={index} />
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

function MenuCard({ menu, index }: { menu: Menu; index: number }) {
  const [openDelete, setOpenDelete] = useState<boolean>(false)
  const bgGradient = { background: gradient(menu.id) }
  return (
    <motion.div
      layout
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring" }}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="grid h-[250px] grid-rows-5 overflow-hidden rounded-lg shadow-lg"
      >
        <Link
          href={`/menu-editor/${menu.id}`}
          prefetch={false}
          className="row-span-3 flex items-center justify-center"
          style={bgGradient}
        >
          <img
            src="safari-pinned-tab.svg"
            alt={menu.name}
            className="size-16 opacity-10"
          />
        </Link>
        <div className="row-span-2 flex flex-col justify-between gap-2 rounded-b-lg bg-white px-4 py-3">
          <Link href={`/menu-editor/${menu.id}`} prefetch={false}>
            <h2 className="font-medium">{menu.name}</h2>
          </Link>
          <div className="flex flex-row items-center justify-between gap-1">
            <div className="flex flex-row gap-1">
              {(() => {
                switch (menu.status) {
                  case MenuStatus.PUBLISHED:
                    return (
                      <Badge variant="blue" className="rounded-full">
                        Publicado
                      </Badge>
                    )
                  case MenuStatus.DRAFT:
                    return (
                      <Badge variant="secondary" className="rounded-full">
                        Borrador
                      </Badge>
                    )
                  default:
                    return null
                }
              })()}

              {index === 0 && menu.status === MenuStatus.PUBLISHED && (
                <Badge
                  variant="green"
                  className="flex items-center justify-between gap-1 rounded-full px-1.5"
                >
                  <CircleCheck className="size-3" />
                  Activo
                </Badge>
              )}
            </div>

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
    </motion.div>
  )
}
