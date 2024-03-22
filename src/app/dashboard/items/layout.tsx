import SecondaryNav from "@/components/dashboard/secondary-nav"

const SecondaryNavItems = [
  {
    title: "Productos",
    href: "/dashboard/items"
  },
  {
    title: "Categorias",
    href: "/dashboard/items/categories"
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
