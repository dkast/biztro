"use client"

import type { Prisma } from "@prisma/client"
import { ChevronLeft } from "lucide-react"

import { GuardLink } from "@/components/dashboard/unsaved-changes-provider"
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
      <GuardLink
        href={`/dashboard`}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="size-5" />
        <span>Regresar a menús</span>
      </GuardLink>
      <MenuTitle menu={menu} />
      <MenuPublish menu={menu} />
    </div>
  )
}
