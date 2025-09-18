"use server"

import { unstable_cache as cache } from "next/cache"
import { headers } from "next/headers"

import { getCurrentMembership } from "@/server/actions/user/queries"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { MenuStatus, SubscriptionStatus } from "@/lib/types"
import { env } from "@/env.mjs"

export async function getMenus() {
  const currentOrg = await auth.api.getFullOrganization({
    headers: await headers()
  })

  if (!currentOrg) {
    return []
  }
  // return await cache(
  //   async () => {
  return await prisma.menu.findMany({
    where: {
      organizationId: currentOrg.id
    },
    orderBy: {
      publishedAt: "desc"
    }
  })
  // },
  //   [`menus-${currentOrg}`],
  //   {
  //     revalidate: 900,
  //     tags: [`menus-${currentOrg}`]
  //   }
  // )()
}

export async function getMenuById(id: string) {
  // return await cache(
  //   async () => {
  const menu = await prisma.menu.findUnique({
    where: {
      id
    },
    include: {
      organization: true
    }
  })

  if (menu?.organization?.banner) {
    menu.organization.banner = `${env.R2_CUSTOM_DOMAIN}/${menu.organization.banner}`
  }

  if (menu?.organization?.logo) {
    menu.organization.logo = `${env.R2_CUSTOM_DOMAIN}/${menu.organization.logo}`
  }

  return menu
  //   },
  //   [`menu-${id}`],
  //   {
  //     revalidate: 900,
  //     tags: [`menu-${id}`]
  //   }
  // )()
}

export async function getMenuByOrgSubdomain(subdomain: string) {
  return await cache(
    async () => {
      return await prisma.menu.findFirst({
        where: {
          status: MenuStatus.PUBLISHED,
          organization: {
            slug: subdomain,
            OR: [
              { status: SubscriptionStatus.ACTIVE },
              { status: SubscriptionStatus.TRIALING }
            ]
          }
        },
        orderBy: {
          publishedAt: "desc"
        }
      })
    },
    [`site-${subdomain}`],
    {
      revalidate: 900,
      tags: [`site-${subdomain}`]
    }
  )()
}

export async function getThemes({ themeType }: { themeType: string }) {
  const membership = await getCurrentMembership()
  const currentOrg = membership?.organizationId
  // return await cache(
  //   async () => {
  return await prisma.theme.findMany({
    where: {
      themeType,
      OR: [
        {
          organizationId: currentOrg
        },
        {
          scope: "GLOBAL",
          organizationId: null
        }
      ]
    }
  })
  //   },
  //   [`themes-${themeType}-${currentOrg}`],
  //   {
  //     revalidate: 900,
  //     tags: [`themes-${themeType}-${currentOrg}`]
  //   }
  // )()
}

export async function getMenuCount() {
  const membership = await getCurrentMembership()
  const currentOrg = membership?.organizationId
  return await prisma.menu.count({
    where: {
      organizationId: currentOrg
    }
  })
}
