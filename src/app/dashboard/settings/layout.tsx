import { CreditCard, MapPin, Settings, Users } from "lucide-react"

import { DashboardSecondaryNav } from "@/components/dashboard/dashboard-secondary-nav"
import type { SecondaryNavItem } from "@/components/dashboard/secondary-nav"

const SecondaryNavItems = [
  {
    title: "General",
    href: "dashboard/settings",
    icon: <Settings className="size-4 shrink-0" />
  },
  {
    title: "Sucursal",
    href: "dashboard/settings/locations",
    icon: <MapPin className="size-4 shrink-0" />
  },
  {
    title: "Miembros",
    href: "dashboard/settings/members",
    icon: <Users className="size-4 shrink-0" />
  },
  {
    title: "Suscripción",
    href: "dashboard/settings/billing",
    icon: <CreditCard className="size-4 shrink-0" />
  }
] satisfies SecondaryNavItem[]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardSecondaryNav items={SecondaryNavItems} />
      <div className="flex grow pb-4">{children}</div>
    </>
  )
}
