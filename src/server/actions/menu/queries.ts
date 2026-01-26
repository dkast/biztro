"use server"

import * as Sentry from "@sentry/nextjs"
import lz from "lzutf8"
import { cacheTag } from "next/cache"

import { getCurrentMembership } from "@/server/actions/user/queries"
import prisma from "@/lib/prisma"
import { MenuStatus, SubscriptionStatus } from "@/lib/types"
import { getCacheBustedImageUrl } from "@/lib/utils"

export async function getMenus(currentOrgId: string) {
  "use cache"
  cacheTag(`menus-${currentOrgId}`)
  if (!currentOrgId) {
    return { menus: [], activeMenuId: null }
  }
  const [menus, organization] = await prisma.$transaction([
    prisma.menu.findMany({
      where: {
        organizationId: currentOrgId
      },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }]
    }),
    prisma.organization.findUnique({
      where: {
        id: currentOrgId
      },
      select: {
        activeMenuId: true
      }
    })
  ])

  return { menus, activeMenuId: organization?.activeMenuId ?? null }
}

export async function getMenuById(id: string) {
  "use cache"
  cacheTag(`menu-${id}`)
  const menu = await prisma.menu.findUnique({
    where: {
      id
    },
    include: {
      organization: true
    }
  })

  if (menu?.organization?.banner) {
    menu.organization.banner = getCacheBustedImageUrl(
      menu.organization.banner,
      menu.organization.updatedAt
    )
  }

  if (menu?.organization?.logo) {
    menu.organization.logo = getCacheBustedImageUrl(
      menu.organization.logo,
      menu.organization.updatedAt
    )
  }

  // If serialData contains a menu background storage key, convert it to a
  // cache-busted URL so clients render the uploaded background immediately.
  if (menu?.serialData) {
    try {
      const serial = lz.decompress(lz.decodeBase64(menu.serialData))
      const nodes = JSON.parse(serial) as Record<string, unknown>

      let changed = false
      for (const nodeId of Object.keys(nodes)) {
        const component = nodes[nodeId]
        if (!component || typeof component !== "object") continue
        const compRec = component as Record<string, unknown>
        const typeObj = compRec["type"] as Record<string, unknown> | undefined
        const resolvedName =
          typeof typeObj?.["resolvedName"] === "string"
            ? (typeObj["resolvedName"] as string)
            : undefined
        if (resolvedName === "ContainerBlock") {
          const propsObj = compRec["props"] as
            | Record<string, unknown>
            | undefined
          const bg =
            typeof propsObj?.["backgroundImage"] === "string"
              ? (propsObj["backgroundImage"] as string)
              : undefined
          if (bg && bg !== "none" && !bg.startsWith("bg") && bg.includes("/")) {
            // If already a full URL (uploaded image cached), leave it as-is
            if (bg.startsWith("http")) {
              continue
            }

            // bg is a storage key like "orgs/{orgId}/menus/{menuId}/background"
            if (propsObj) {
              propsObj["backgroundImage"] = getCacheBustedImageUrl(
                bg,
                menu.updatedAt
              )
              changed = true
            }
          }
        }
      }

      if (changed) {
        const updated = JSON.stringify(nodes)
        menu.serialData = lz.encodeBase64(lz.compress(updated))
      }
    } catch (err) {
      Sentry.captureException(err, {
        tags: { section: "menu-transform-backgrounds" },
        extra: { menuId: id }
      })
    }
  }

  return menu
}

export async function getActiveMenuByOrganizationSlug(slug: string) {
  "use cache"
  cacheTag(`subdomain-${slug}`)
  const organization = await prisma.organization.findFirst({
    where: {
      slug,
      OR: [
        { status: SubscriptionStatus.ACTIVE },
        { status: SubscriptionStatus.TRIALING },
        { status: SubscriptionStatus.SPONSORED }
      ]
    },
    select: {
      id: true,
      activeMenuId: true
    }
  })

  if (!organization) {
    return null
  }

  if (organization.activeMenuId) {
    const activeMenu = await prisma.menu.findFirst({
      where: {
        id: organization.activeMenuId,
        organizationId: organization.id,
        status: MenuStatus.PUBLISHED
      }
    })

    if (activeMenu) {
      return activeMenu
    }
  }

  return await prisma.menu.findFirst({
    where: {
      status: MenuStatus.PUBLISHED,
      organizationId: organization.id
    },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }]
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
