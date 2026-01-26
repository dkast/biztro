import { Suspense } from "react"
import { ChevronRight, ChevronRightIcon, GlobeIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import OnboardingStatus from "@/components/dashboard/onboarding-status"
import PageSubtitle from "@/components/dashboard/page-subtitle"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { getMenus } from "@/server/actions/menu/queries"
import {
  getCurrentOrganization,
  hasOrganizations
} from "@/server/actions/user/queries"
import MenuList from "@/app/dashboard/menu-list"

export const metadata: Metadata = {
  title: "Inicio"
}

export default async function DashboardPage() {
  const [orgAvailable, currentOrg] = await Promise.all([
    hasOrganizations(),
    getCurrentOrganization()
  ])

  if (!orgAvailable) {
    redirect("/new-org")
  }

  const menus = getMenus(currentOrg?.id as string)

  return (
    <div className="flex grow bg-gray-50 pb-4 dark:bg-gray-950">
      <div
        className="mx-auto grid grow auto-rows-min justify-center gap-10 px-4
          py-10 sm:grid-cols-300 sm:px-6 sm:py-12"
      >
        <div className="col-span-full">
          <Suspense fallback={<OnboardingSkeleton />}>
            <OnboardingStatus orgId={currentOrg?.id} />
          </Suspense>
        </div>
        <div className="col-span-full">
          <PageSubtitle
            title="Menús"
            description="Todos los menús."
            additionalInfo="Aquí puedes ver todos los menús de tu organización. El menú activo es público para tus clientes. Solo puede haber un menú activo a la vez."
          >
            <Item size="sm" variant="outline" asChild>
              <Link
                href={currentOrg?.slug as string}
                className="block w-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ItemMedia>
                  <GlobeIcon className="size-4" />
                  <ItemContent>
                    <ItemTitle>Visita tu menú en línea</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <ChevronRightIcon className="size-4" />
                  </ItemActions>
                </ItemMedia>
              </Link>
            </Item>
          </PageSubtitle>
        </div>
        <Suspense fallback={<MenuListSkeleton />}>
          <MenuList promiseMenus={menus} />
        </Suspense>
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

function MenuListSkeleton() {
  return (
    <>
      <Skeleton className="h-[250px]" />
      <Skeleton className="h-[250px]" />
      <Skeleton className="h-[250px]" />
      <Skeleton className="h-[250px]" />
    </>
  )
}
