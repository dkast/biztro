import PageSubtitle from "@/components/dashboard/page-subtitle"
import MenuCreate from "@/app/dashboard/menu-create"
import MenuList from "@/app/dashboard/menu-list"
import { getMenus } from "@/server/actions/menu/queries"

export default async function DashboardPage() {
  const data = await getMenus()

  return (
    <div className="flex grow bg-gray-50 pb-4">
      <div className="mx-auto grid grow auto-rows-min grid-cols-300 justify-center gap-10 px-4 py-10 sm:px-6 sm:py-12">
        <div className="col-span-full">
          <PageSubtitle title="Menús" description="Todos los menús" />
        </div>
        <MenuList menus={data} />
        <MenuCreate />
      </div>
    </div>
  )
}
