"use client"

import type { Prisma } from "@prisma/client"

import MenuPublish from "@/components/menu-editor/menu-publish"
import MenuTitle from "@/components/menu-editor/menu-title"
import type { getMenuById } from "@/server/actions/menu/queries"

export default function Toolbar({
  menu
}: {
  menu: Prisma.PromiseReturnType<typeof getMenuById>
}) {
  return (
    <div className="mx-10 grid grow grid-cols-3 items-center">
      <div></div>
      <MenuTitle menu={menu} />
      <MenuPublish menu={menu} />
    </div>
  )
}
