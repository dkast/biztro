import SecondaryNav from "@/components/dashboard/secondary-nav"

const SecondaryNavItems = [
  {
    title: "Productos",
    href: "dashboard/menu-items"
  },
  {
    title: "Categorias",
    href: "dashboard/menu-items/categories"
  }
]

export default function Layout({
  children,
  modal
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      <SecondaryNav items={SecondaryNavItems} />
      <div className="flex grow pb-4">{children}</div>
      {modal}
    </>
  )
}
