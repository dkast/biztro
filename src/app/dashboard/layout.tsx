import {
  dehydrate,
  HydrationBoundary,
  QueryClient
} from "@tanstack/react-query"

import AppSidebar from "@/components/dashboard/app-sidebar"
import Header from "@/components/dashboard/header"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import {
  getCurrentOrganization,
  getUserMemberships
} from "@/server/actions/user/queries"

export default async function Layout({
  children
}: {
  children: React.ReactNode
}) {
  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["workgroup", "current"],
      queryFn: getCurrentOrganization
    }),
    queryClient.prefetchQuery({
      queryKey: ["workgroup", "memberships"],
      queryFn: getUserMemberships
    })
  ])

  return (
    <div className="flex grow flex-col">
      <SidebarProvider>
        <HydrationBoundary state={dehydrate(queryClient)}>
          {/* <Sidebar /> */}

          <AppSidebar />
        </HydrationBoundary>
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
