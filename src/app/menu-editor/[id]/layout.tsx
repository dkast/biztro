import Header from "@/components/dashboard/header"
import Toolbar from "@/components/menu-editor/toolbar"

export default function Layout({
  children,
  params
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  return (
    <div className="flex grow flex-col">
      <Header>
        <Toolbar menuId={params.id} />
      </Header>
      <div className="flex grow flex-col pt-16">{children}</div>
    </div>
  )
}
