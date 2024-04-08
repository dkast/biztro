"use server"

import { unstable_cache as cache } from "next/cache"
import { cookies } from "next/headers"

import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"

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
