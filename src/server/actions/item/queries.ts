"use server"

import { cacheTag } from "next/cache"

import { getCurrentMembership } from "@/server/actions/user/queries"
import prisma from "@/lib/prisma"
import type { MenuItemQueryFilter } from "@/lib/types"
import { getCacheBustedImageUrl } from "@/lib/utils"
import { env } from "@/env.mjs"

export async function getMenuItems(
  filter: MenuItemQueryFilter,
  organizationId: string
) {
  "use cache"

  if (!organizationId) {
    return []
  }

  cacheTag(`menu-items-${organizationId}`)
  return await prisma.menuItem.findMany({
    where: {
      organizationId,
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
}

export async function getMenuItemById(id: string) {
  "use cache"

  cacheTag(`menu-item-${id}`)
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
    item.image = getCacheBustedImageUrl(item.image, item.updatedAt)
  }

  return item
}

export async function getCategories(organizationId: string) {
  "use cache"

  cacheTag(`categories-${organizationId}`)
  if (!organizationId) {
    return []
  }

  return await prisma.category.findMany({
    where: {
      organizationId
    }
  })
}

export async function getCategoriesWithItems() {
  const membership = await getCurrentMembership()
  const currentOrg = membership?.organizationId
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
        },
        orderBy: {
          name: "asc"
        }
      }
    }
  })

  // Get the image URL for each item
  for (const category of data) {
    for (const item of category.menuItems) {
      if (item.image) {
        item.image = getCacheBustedImageUrl(item.image, item.updatedAt)
      }
    }
  }

  return data
}

export async function getMenuItemsWithoutCategory() {
  const membership = await getCurrentMembership()
  const currentOrg = membership?.organizationId
  if (!currentOrg) {
    return []
  }

  const data = await prisma.menuItem.findMany({
    where: {
      organizationId: currentOrg,
      categoryId: null,
      status: "ACTIVE"
    },
    include: {
      variants: {
        orderBy: {
          price: "asc"
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  })

  // Get the image URL for each item
  for (const item of data) {
    if (item.image) {
      // Add cache-busting query parameter based on updatedAt
      const timestamp = item.updatedAt.getTime()
      item.image = `${env.R2_CUSTOM_DOMAIN}/${item.image}?v=${timestamp}`
    }
  }

  return data
}

export async function getItemCount() {
  const membership = await getCurrentMembership()
  const currentOrg = membership?.organizationId

  if (!currentOrg) {
    return 0
  }

  return await prisma.menuItem.count({
    where: {
      organizationId: currentOrg
    }
  })
}

export async function getFeaturedItems() {
  const membership = await getCurrentMembership()
  const currentOrg = membership?.organizationId
  if (!currentOrg) {
    return []
  }

  const data = await prisma.menuItem.findMany({
    where: {
      organizationId: currentOrg,
      featured: true,
      status: "ACTIVE"
    },
    include: {
      variants: {
        orderBy: {
          price: "asc"
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  })

  // Get the image URL for each item
  for (const item of data) {
    if (item.image) {
      item.image = getCacheBustedImageUrl(item.image, item.updatedAt)
    }
  }

  return data
}
