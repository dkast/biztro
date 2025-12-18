"use server"

import { cacheTag } from "next/cache"

import { getCurrentMembership } from "@/server/actions/user/queries"
import prisma from "@/lib/prisma"
import { MenuStatus, SubscriptionStatus } from "@/lib/types"
import { env } from "@/env.mjs"

export async function getMenus(currentOrgId: string) {
  "use cache"
  cacheTag(`menus-${currentOrgId}`)
  if (!currentOrgId) {
    return []
  }
  return await prisma.menu.findMany({
    where: {
      organizationId: currentOrgId
    },
    orderBy: {
      publishedAt: "desc"
    }
  })
}

export async function getMenuById(id: string) {
  const menu = await prisma.menu.findUnique({
    where: {
      id
    },
    include: {
      organization: true
    }
  })

  if (menu?.organization?.banner) {
    // Add cache-busting query parameter based on updatedAt
    const timestamp = menu.organization.updatedAt.getTime()
    menu.organization.banner = `${env.R2_CUSTOM_DOMAIN}/${menu.organization.banner}?v=${timestamp}`
  }

  if (menu?.organization?.logo) {
    // Add cache-busting query parameter based on updatedAt
    const timestamp = menu.organization.updatedAt.getTime()
    menu.organization.logo = `${env.R2_CUSTOM_DOMAIN}/${menu.organization.logo}?v=${timestamp}`
  }

  return menu
}

export async function getActiveMenuByOrganizationSlug(slug: string) {
  "use cache"
  cacheTag(`subdomain-${slug}`)
  return await prisma.menu.findFirst({
    where: {
      status: MenuStatus.PUBLISHED,
      organization: {
        slug,
        OR: [
          { status: SubscriptionStatus.ACTIVE },
          { status: SubscriptionStatus.TRIALING },
          { status: SubscriptionStatus.SPONSORED }
        ]
      }
    },
    orderBy: {
      publishedAt: "desc"
    }
  })
}

export async function getThemes({ themeType }: { themeType: string }) {
  const membership = await getCurrentMembership()
  const currentOrg = membership?.organizationId
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
