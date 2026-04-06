import { Languages, ShoppingBag, Tags } from "lucide-react"

import { DashboardSecondaryNav } from "@/components/dashboard/dashboard-secondary-nav"
import type { SecondaryNavItem } from "@/components/dashboard/secondary-nav"

const SecondaryNavItems = [
  {
    title: "Productos",
    href: "dashboard/menu-items",
    icon: <ShoppingBag className="size-4 shrink-0" />
  },
  {
    title: "Categorías",
    href: "dashboard/menu-items/categories",
    icon: <Tags className="size-4 shrink-0" />
  },
  {
    title: "Traducciones",
    href: "dashboard/menu-items/translations",
    icon: <Languages className="size-4 shrink-0" />
  }
] satisfies SecondaryNavItem[]

export default function Layout({
  children,
  modal
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      <DashboardSecondaryNav items={SecondaryNavItems} />
      <div className="relative w-full">{modal}</div>
      <div className="flex grow pb-4">{children}</div>
    </>
  )
}
