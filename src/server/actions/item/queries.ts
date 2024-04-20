"use server"

import { unstable_cache as cache } from "next/cache"
import { cookies } from "next/headers"

import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"
import type { MenuItemQueryFilter } from "@/lib/types"
import { env } from "@/env.mjs"

export async function getMenuItems(filter: MenuItemQueryFilter) {
  const currentOrg = cookies().get(appConfig.cookieOrg)?.value
  // return cache(
  //   async () => {

  if (!currentOrg) {
    return []
  }

  return await prisma.menuItem.findMany({
    where: {
      organizationId: currentOrg,
      status: filter?.status ? { in: filter.status.split(",") } : undefined,
      categoryId: filter?.category
        ? { in: filter.category.split(",") }
        : undefined
    },
    include: {
      category: true,
      variants: true
    }
  })
  //   },
  //   [`menuItems-${currentOrg}`],
  //   {
  //     revalidate: 900,
  //     tags: [`menuItems-${currentOrg}`]
  //   }
  // )()
}

export async function getMenuItemById(id: string) {
  // return cache(
  //   async () => {
  const item = await prisma.menuItem.findUnique({
    where: {
      id
    },
    include: {
      category: true,
      variants: true
    }
  })

  if (item?.image) {
    item.image = env.R2_CUSTOM_DOMAIN + "/" + item.image
  }

  return item
  //   },
  //   [`menuItem-${id}`],
  //   {
  //     revalidate: 900,
  //     tags: [`menuItem-${id}`]
  //   }
  // )()
}

export async function getCategories() {
  const currentOrg = cookies().get(appConfig.cookieOrg)?.value
  return await cache(
    async () => {
      if (!currentOrg) {
        return []
      }

      return await prisma.category.findMany({
        where: {
          organizationId: currentOrg
        }
      })
    },
    [`categories-${currentOrg}`],
    {
      revalidate: 900,
      tags: [`categories-${currentOrg}`]
    }
  )()
}

export async function getCategoriesWithItems() {
  const currentOrg = cookies().get(appConfig.cookieOrg)?.value
  return await cache(
    async () => {
      if (!currentOrg) {
        return []
      }

      const data = await prisma.category.findMany({
        where: {
          organizationId: currentOrg,
          menuItems: {
            some: {
              status: "ACTIVE"
            }
          }
        },
        include: {
          menuItems: {
            where: {
              status: "ACTIVE"
            },
            include: {
              variants: {
                orderBy: {
                  price: "asc"
                }
              }
            }
          }
        }
      })

      // Get the image URL for each item
      for (const category of data) {
        for (const item of category.menuItems) {
          if (item.image) {
            item.image = env.R2_CUSTOM_DOMAIN + "/" + item.image
          }
        }
      }

      return data
    },
    [`categoriesWithItems-${currentOrg}`],
    {
      revalidate: 900,
      tags: [`categoriesWithItems-${currentOrg}`]
    }
  )()
}
