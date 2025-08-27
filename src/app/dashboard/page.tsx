import { Suspense } from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

import InfoHelper from "@/components/dashboard/info-helper"
import OnboardingStatus from "@/components/dashboard/onboarding-status"
import PageSubtitle from "@/components/dashboard/page-subtitle"
import { Skeleton } from "@/components/ui/skeleton"
import { getMenus } from "@/server/actions/menu/queries"
import { hasOrganizations } from "@/server/actions/user/queries"
import MenuList from "@/app/dashboard/menu-list"

export const metadata: Metadata = {
  title: "Inicio"
}

export default async function DashboardPage() {
  const [orgAvailable, data] = await Promise.all([
    hasOrganizations(),
    getMenus()
  ])

  if (!orgAvailable) {
    redirect("/new-org")
  }

  return (
    <div className="flex grow bg-gray-50 pb-4 dark:bg-gray-950">
      <div className="mx-auto grid grow auto-rows-min justify-center gap-10 px-4 py-10 sm:grid-cols-300 sm:px-6 sm:py-12">
        <div className="col-span-full">
          {/* <Suspense fallback={<OnboardingSkeleton />}>
            <OnboardingStatus orgId={currentOrg.id} />
          </Suspense> */}
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

function OnboardingSkeleton() {
  return (
    <>
      <Skeleton className="h-12 w-1/2" />
      <div className="mt-8 grid grid-cols-3 gap-2">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    </>
  )
}
