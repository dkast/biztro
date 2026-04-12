import { Suspense } from "react"
import { redirect } from "next/navigation"

import AppSidebar, {
  SkeletonWorkgroup
} from "@/components/dashboard/app-sidebar"
import Header from "@/components/dashboard/header"
import { ThemeSwitcher } from "@/components/theme-switcher/theme-switcher"
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar"
import {
  getCurrentOrganization,
  hasOrganizations
} from "@/server/actions/user/queries"

export default async function Layout({
  children
}: {
  children: React.ReactNode
}) {
  const [organization, organizationCount] = await Promise.all([
    getCurrentOrganization(),
    hasOrganizations()
  ])

  if (!organization && !organizationCount) {
    redirect("/new-org")
  }

  return (
    <div className="flex grow flex-col overscroll-contain">
      <SidebarProvider>
        <Sidebar>
          <Suspense fallback={<SkeletonWorkgroup />}>
            <AppSidebar promiseOrganization={Promise.resolve(organization)} />
          </Suspense>
        </Sidebar>
        <main
          className="dark:bg-background relative flex min-w-0 grow flex-col
            overscroll-contain bg-gray-50"
        >
          <Header showLogo={false} className="sticky top-0 z-50 w-full">
            <div className="flex w-full items-center gap-2 sm:gap-4">
              <SidebarTrigger
                className="size-5 text-gray-400 dark:text-gray-500"
              />
              <ThemeSwitcher />
            </div>
          </Header>
          {children}
        </main>
      </SidebarProvider>
    </div>
  )
}
