"use server"

import { unstable_cache as cache } from "next/cache"
import { cookies } from "next/headers"

import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"
import { MenuStatus } from "@/lib/types"
import { env } from "@/env.mjs"

export async function getMenus() {
  const currentOrg = cookies().get(appConfig.cookieOrg)?.value

  if (!currentOrg) {
    return []
  }
  // return await cache(
  //   async () => {
  return await prisma.menu.findMany({
    where: {
      organizationId: currentOrg
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
            subdomain
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
  const currentOrg = cookies().get(appConfig.cookieOrg)?.value
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
