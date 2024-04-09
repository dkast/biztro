"use client"

import type { Menu } from "@prisma/client"

import MenuPublish from "@/components/menu-editor/menu-publish"
import MenuTitle from "@/components/menu-editor/menu-title"

export default function Toolbar({ menu }: { menu: Menu }) {
  return (
    <div className="mx-10 grid grow grid-cols-3 items-center">
      <div></div>
      <MenuTitle menu={menu} />
      <MenuPublish menu={menu} />
    </div>
  )
}
