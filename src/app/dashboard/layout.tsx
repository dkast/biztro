import { Suspense } from "react"

import AppSidebar, {
  SkeletonWorkgroup
} from "@/components/dashboard/app-sidebar"
import Header from "@/components/dashboard/header"
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { getCurrentOrganization } from "@/server/actions/user/queries"

export default async function Layout({
  children
}: {
  children: React.ReactNode
}) {
  const organization = getCurrentOrganization()

  return (
    <div className="flex grow flex-col">
      <SidebarProvider>
        <Sidebar>
          <Suspense fallback={<SkeletonWorkgroup />}>
            <AppSidebar promiseOrganization={organization} />
          </Suspense>
        </Sidebar>
        <main className="flex grow flex-col">
          <Header showLogo={false}>
            <SidebarTrigger className="size-5 text-gray-400 dark:text-gray-500" />
          </Header>
          {children}
        </main>
      </SidebarProvider>
    </div>
  )
}
