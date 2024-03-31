"use client"

import type { Menu } from "@prisma/client"
import { motion } from "framer-motion"
import Link from "next/link"

export default function MenuList({ menus }: { menus: Menu[] }) {
  return (
    <>
      {menus.map(menu => (
        <div key={menu.id}>
          <Link href={`/menu-editor/${menu.id}`}>
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
          <div className="flex flex-col gap-2 py-3">
            <h2>{menu.name}</h2>
            <p>{menu.description}</p>
          </div>
        </div>
      ))}
    </>
  )
}
