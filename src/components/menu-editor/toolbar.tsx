"use client"

import type { Prisma } from "@prisma/client"
import { ChevronLeft } from "lucide-react"

import { GuardLink } from "@/components/dashboard/unsaved-changes-provider"
import MenuPublish from "@/components/menu-editor/menu-publish"
import MenuTitle from "@/components/menu-editor/menu-title"
import { Button } from "@/components/ui/button"
import type { getMenuById } from "@/server/actions/menu/queries"

export default function Toolbar({
  menu
}: {
  menu: Prisma.PromiseReturnType<typeof getMenuById>
}) {
  return (
    <div className="mx-10 grid grow grid-cols-3 items-center">
      <GuardLink href={`/dashboard`}>
        <Button variant="ghost" size="sm">
          <ChevronLeft className="size-5" />
          Regresar
        </Button>
      </GuardLink>
      <MenuTitle menu={menu} />
      <MenuPublish menu={menu} />
    </div>
  )
}
