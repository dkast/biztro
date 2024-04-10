import {
  dehydrate,
  HydrationBoundary,
  QueryClient
} from "@tanstack/react-query"

import Header from "@/components/dashboard/header"
import Sidebar from "@/components/dashboard/sidebar"
import { getCurrentOrganization } from "@/server/actions/user/queries"

export default async function Layout({
  children
}: {
  children: React.ReactNode
}) {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["workgroup", "current"],
    queryFn: getCurrentOrganization
  })

  return (
    <div className="flex grow flex-col">
      <Header />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Sidebar />
      </HydrationBoundary>
      <div className="flex grow flex-col pt-16 lg:pl-60">{children}</div>
    </div>
  )
}
