"use client"

import SecondaryNav, {
  type SecondaryNavItem
} from "@/components/dashboard/secondary-nav"

type DashboardSecondaryNavProps = {
  items: SecondaryNavItem[]
}

export function DashboardSecondaryNav({ items }: DashboardSecondaryNavProps) {
  return <SecondaryNav items={items} />
}
