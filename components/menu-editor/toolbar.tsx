import ToolbarTitle from "@/components/menu-editor/toolbar-title"
import { getMenuById } from "@/server/actions/menu/queries"

export default async function Toolbar({ menuId }: { menuId: string }) {
  const menu = await getMenuById(menuId)

  if (!menu) {
    return null
  }

  return (
    <div className="mx-10 flex grow justify-around">
      <ToolbarTitle menu={menu} />
    </div>
  )
}
