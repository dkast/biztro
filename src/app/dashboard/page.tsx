import type { Metadata } from "next"
import { notFound } from "next/navigation"

import InfoHelper from "@/components/dashboard/info-helper"
import OnboardingStatus from "@/components/dashboard/onboarding-status"
import PageSubtitle from "@/components/dashboard/page-subtitle"
import MenuList from "@/app/dashboard/menu-list"
import { getMenus } from "@/server/actions/menu/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"

export const metadata: Metadata = {
  title: "Inicio"
}

export default async function DashboardPage() {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    notFound()
  }

  const data = await getMenus()

  return (
    <div className="flex grow bg-gray-50 pb-4 dark:bg-gray-950">
      <div className="mx-auto grid grow auto-rows-min grid-cols-300 justify-center gap-10 px-4 py-10 sm:px-6 sm:py-12">
        <div className="col-span-full">
          <OnboardingStatus />
        </div>
        <div className="col-span-full">
          <PageSubtitle title="Menús" description="Todos los menús.">
            <InfoHelper>
              Aquí puedes ver todos los menús de tu organización. El menú activo
              es público para tus clientes. Solo puede haber un menú activo a la
              vez.
            </InfoHelper>
          </PageSubtitle>
        </div>
        <MenuList menus={data} />
      </div>
    </div>
  )
}
