"use server"

import { unstable_cache as cache } from "next/cache"
import { cookies } from "next/headers"

import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"
import { MenuStatus } from "@/lib/types"

export async function getMenus() {
  const currentOrg = cookies().get(appConfig.cookieOrg)?.value
  // return await cache(
  //   async () => {
  return await prisma.menu.findMany({
    where: {
      organizationId: currentOrg
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
  return await cache(
    async () => {
      return await prisma.menu.findUnique({
        where: {
          id
        },
        include: {
          organization: true
        }
      })
    },
    [`menu-${id}`],
    {
      revalidate: 900,
      tags: [`menu-${id}`]
    }
  )()
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
