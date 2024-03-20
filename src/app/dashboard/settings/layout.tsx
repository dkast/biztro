import SecondaryNav from "@/components/dashboard/secondary-nav"

const SecondaryNavItems = [
  {
    title: "General",
    href: "/dashboard/settings"
  },
  {
    title: "Sucursales",
    href: "/dashboard/settings/locations"
  },
  {
    title: "Miembros",
    href: "/dashboard/settings/members"
  }
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SecondaryNav items={SecondaryNavItems} />
      <div className="flex grow pb-4">{children}</div>
    </>
  )
}
