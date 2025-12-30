"use server"

import type { Organization } from "@/generated/prisma-client/client"
import lz from "lzutf8"
import { revalidatePath, updateTag } from "next/cache"
import { z } from "zod/v4"

import prisma from "@/lib/prisma"
import { authMemberActionClient } from "@/lib/safe-actions"
import { MenuStatus } from "@/lib/types"
import { getCacheBustedImageUrl } from "@/lib/utils"

type MenuSyncPreference = {
  menuSync?: {
    updatePublishedOnCatalogChange?: boolean
  }
}

type NodeMap = Record<string, unknown>

type Node = {
  type?: { resolvedName?: string }
  props?: Record<string, unknown>
}

type CatalogDataSources = {
  organization: Organization | null
  location: Awaited<ReturnType<typeof getDefaultLocationByOrg>>
  categories: Awaited<ReturnType<typeof getCategoriesWithItemsByOrg>>
  featuredItems: Awaited<ReturnType<typeof getFeaturedItemsByOrg>>
  soloItems: Awaited<ReturnType<typeof getSoloItemsByOrg>>
}

type RehydrateOptions = {
  organizationId: string
  updateDraft: boolean
  updatePublished: boolean
}

type RehydrateCounts = {
  draftsUpdated: number
  publishedUpdated: number
}

async function getMenuSyncPreference(organizationId: string) {
  if (!organizationId) return null
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { metadata: true }
  })

  if (!org?.metadata) return null
  try {
    const parsed = JSON.parse(org.metadata) as MenuSyncPreference
    const value = parsed.menuSync?.updatePublishedOnCatalogChange
    return typeof value === "boolean" ? value : null
  } catch (error) {
    console.error("Failed to parse organization metadata", error)
    return null
  }
}

async function setMenuSyncPreference(
  organizationId: string,
  updatePublishedOnCatalogChange: boolean
) {
  if (!organizationId) return
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { metadata: true }
  })

  const current: MenuSyncPreference = org?.metadata
    ? (() => {
        try {
          return JSON.parse(org.metadata) as MenuSyncPreference
        } catch (error) {
          console.error("Failed to parse organization metadata", error)
          return {}
        }
      })()
    : {}

  const next: MenuSyncPreference = {
    ...current,
    menuSync: {
      ...(current.menuSync ?? {}),
      updatePublishedOnCatalogChange
    }
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      metadata: JSON.stringify(next)
    }
  })

  updateTag(`organization-${organizationId}`)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function decodeNodes(serialData?: string | null) {
  if (!serialData) return null
  try {
    const serial = lz.decompress(lz.decodeBase64(serialData))
    const parsed = JSON.parse(serial) as unknown
    return isRecord(parsed) ? (parsed as NodeMap) : null
  } catch (error) {
    console.error("Failed to decode menu serial data", error)
    return null
  }
}

function encodeNodes(nodes: NodeMap) {
  const json = JSON.stringify(nodes)
  return lz.encodeBase64(lz.compress(json))
}

function assignIfChanged<T>(
  container: Record<string, unknown>,
  key: string,
  value: T
) {
  const prev = container[key]
  const changed = JSON.stringify(prev) !== JSON.stringify(value)
  if (changed) {
    container[key] = value as unknown
  }
  return changed
}

function pruneNode(nodes: NodeMap, nodeId: string) {
  delete nodes[nodeId]
}

async function getOrganizationWithAssets(organizationId: string) {
  if (!organizationId) return null
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId }
  })

  if (!organization) return null

  if (organization.banner) {
    organization.banner = getCacheBustedImageUrl(
      organization.banner,
      organization.updatedAt
    )
  }

  if (organization.logo) {
    organization.logo = getCacheBustedImageUrl(
      organization.logo,
      organization.updatedAt
    )
  }

  return organization
}

async function getDefaultLocationByOrg(organizationId: string) {
  if (!organizationId) return null
  return await prisma.location.findFirst({
    where: { organizationId },
    include: { openingHours: true },
    orderBy: { createdAt: "asc" }
  })
}

async function getCategoriesWithItemsByOrg(organizationId: string) {
  if (!organizationId) return []
  const data = await prisma.category.findMany({
    where: {
      organizationId,
      menuItems: {
        some: {
          status: "ACTIVE"
        }
      }
    },
    include: {
      menuItems: {
        where: { status: "ACTIVE" },
        include: {
          variants: { orderBy: { price: "asc" } }
        },
        orderBy: { name: "asc" }
      }
    }
  })

  for (const category of data) {
    for (const item of category.menuItems) {
      if (item.image) {
        item.image = getCacheBustedImageUrl(item.image, item.updatedAt)
      }
    }
  }

  return data
}

async function getFeaturedItemsByOrg(organizationId: string) {
  if (!organizationId) return []
  const data = await prisma.menuItem.findMany({
    where: { organizationId, featured: true, status: "ACTIVE" },
    include: {
      variants: { orderBy: { price: "asc" } }
    },
    orderBy: { name: "asc" }
  })

  for (const item of data) {
    if (item.image) {
      item.image = getCacheBustedImageUrl(item.image, item.updatedAt)
    }
  }

  return data
}

async function getSoloItemsByOrg(organizationId: string) {
  if (!organizationId) return []
  const data = await prisma.menuItem.findMany({
    where: { organizationId, categoryId: null, status: "ACTIVE" },
    include: {
      variants: { orderBy: { price: "asc" } }
    },
    orderBy: { name: "asc" }
  })

  for (const item of data) {
    if (item.image) {
      item.image = getCacheBustedImageUrl(item.image, item.updatedAt)
    }
  }

  return data
}

function rehydrateNodes(nodes: NodeMap, dataSources: CatalogDataSources) {
  let changed = false

  for (const property of Object.keys(nodes)) {
    const component = nodes[property] as Node | undefined
    if (!component) continue

    const resolvedName = component.type?.resolvedName
    const componentProps = (component.props ??= {})

    switch (resolvedName) {
      case "CategoryBlock": {
        const categoryId = (componentProps?.data as { id?: string } | undefined)
          ?.id
        if (!categoryId) {
          pruneNode(nodes, property)
          changed = true
          break
        }
        const dbCategory = dataSources.categories.find(
          cat => cat.id === categoryId
        )
        if (dbCategory) {
          changed =
            assignIfChanged(componentProps, "data", dbCategory) || changed
        } else {
          pruneNode(nodes, property)
          changed = true
        }
        break
      }
      case "HeaderBlock": {
        changed =
          assignIfChanged(
            componentProps,
            "organization",
            dataSources.organization
          ) || changed
        changed =
          assignIfChanged(componentProps, "location", dataSources.location) ||
          changed
        break
      }
      case "FeaturedBlock": {
        changed =
          assignIfChanged(componentProps, "items", dataSources.featuredItems) ||
          changed
        break
      }
      case "ItemBlock": {
        const itemId = (componentProps?.item as { id?: string } | undefined)?.id
        if (!itemId) {
          pruneNode(nodes, property)
          changed = true
          break
        }
        const dbItem = dataSources.soloItems.find(item => item.id === itemId)
        if (dbItem) {
          changed = assignIfChanged(componentProps, "item", dbItem) || changed
        } else {
          pruneNode(nodes, property)
          changed = true
        }
        break
      }
      default:
        break
    }
  }

  return { nodes, changed }
}

async function rehydrateMenusForOrganization({
  organizationId,
  updateDraft,
  updatePublished
}: RehydrateOptions): Promise<RehydrateCounts> {
  if (!organizationId) {
    return { draftsUpdated: 0, publishedUpdated: 0 }
  }

  const [organization, location, categories, featuredItems, soloItems] =
    await Promise.all([
      getOrganizationWithAssets(organizationId),
      getDefaultLocationByOrg(organizationId),
      getCategoriesWithItemsByOrg(organizationId),
      getFeaturedItemsByOrg(organizationId),
      getSoloItemsByOrg(organizationId)
    ])

  const menus = await prisma.menu.findMany({
    where: { organizationId },
    select: {
      id: true,
      serialData: true,
      publishedData: true,
      status: true
    }
  })

  let draftsUpdated = 0
  let publishedUpdated = 0

  for (const menu of menus) {
    if (updateDraft && menu.serialData) {
      const nodes = decodeNodes(menu.serialData)
      if (nodes) {
        const { nodes: hydratedNodes, changed } = rehydrateNodes(nodes, {
          organization,
          location,
          categories,
          featuredItems,
          soloItems
        })
        if (changed) {
          const serialData = encodeNodes(hydratedNodes)
          await prisma.menu.update({
            where: { id: menu.id },
            data: { serialData }
          })
          draftsUpdated += 1
          updateTag(`menu-${menu.id}`)
        }
      }
    }

    if (
      updatePublished &&
      menu.publishedData &&
      menu.status === MenuStatus.PUBLISHED
    ) {
      const nodes = decodeNodes(menu.publishedData)
      if (nodes) {
        const { nodes: hydratedNodes, changed } = rehydrateNodes(nodes, {
          organization,
          location,
          categories,
          featuredItems,
          soloItems
        })
        if (changed) {
          const publishedData = encodeNodes(hydratedNodes)
          await prisma.menu.update({
            where: { id: menu.id },
            data: { publishedData }
          })
          publishedUpdated += 1
          updateTag(`menu-${menu.id}`)
        }
      }
    }
  }

  const orgSlug = organization?.slug
  if (orgSlug) {
    updateTag(`subdomain-${orgSlug}`)
    revalidatePath(`/${orgSlug}`)
  }

  updateTag(`menus-${organizationId}`)

  return { draftsUpdated, publishedUpdated }
}

export const syncMenusAfterCatalogChange = authMemberActionClient
  .inputSchema(
    z.object({
      organizationId: z.string(),
      updatePublished: z.boolean(),
      rememberChoice: z.boolean().optional()
    })
  )
  .action(
    async ({
      parsedInput: { organizationId, updatePublished, rememberChoice }
    }) => {
      try {
        const counts = await rehydrateMenusForOrganization({
          organizationId,
          updateDraft: true,
          updatePublished
        })

        if (rememberChoice) {
          await setMenuSyncPreference(organizationId, updatePublished)
        }

        return { success: counts }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "No se pudo sincronizar el menú"
        return { failure: { reason: message } }
      }
    }
  )

export async function applyMenuSyncAfterChange({
  organizationId,
  updatePublished
}: {
  organizationId: string
  updatePublished: boolean
}) {
  return await rehydrateMenusForOrganization({
    organizationId,
    updateDraft: true,
    updatePublished
  })
}

export async function resolveMenuSyncPreference(organizationId: string) {
  return await getMenuSyncPreference(organizationId)
}

export async function persistMenuSyncPreference(
  organizationId: string,
  updatePublished: boolean
) {
  await setMenuSyncPreference(organizationId, updatePublished)
}

/**
 * Executes menu sync logic with preference handling.
 * This helper consolidates the repeated pattern of:
 * 1. Checking user preference
 * 2. Determining whether to update published menus
 * 3. Applying sync
 * 4. Persisting preference if requested
 *
 * @param options - Configuration for sync execution
 * @param options.organizationId - Organization ID to sync menus for
 * @param options.updatePublishedMenus - User's explicit choice to update published menus (undefined if not chosen)
 * @param options.rememberPublishedChoice - Whether to persist the user's choice as a preference
 * @returns Sync results including counts and whether user needs to make a decision
 */
export async function executeMenuSyncWithPreference({
  organizationId,
  updatePublishedMenus,
  rememberPublishedChoice
}: {
  organizationId: string
  updatePublishedMenus?: boolean
  rememberPublishedChoice?: boolean
}) {
  const preference = await resolveMenuSyncPreference(organizationId)
  const hasUserChoice = typeof updatePublishedMenus === "boolean"
  const shouldUpdatePublished = hasUserChoice
    ? updatePublishedMenus
    : preference === true
  const shouldSkipSync = !hasUserChoice && preference === null

  const syncResult = !shouldSkipSync
    ? await applyMenuSyncAfterChange({
        organizationId,
        updatePublished: shouldUpdatePublished
      })
    : { draftsUpdated: 0, publishedUpdated: 0 }

  if (rememberPublishedChoice && typeof shouldUpdatePublished === "boolean") {
    await persistMenuSyncPreference(organizationId, shouldUpdatePublished)
  }

  return {
    draftsUpdated: syncResult.draftsUpdated,
    publishedUpdated: syncResult.publishedUpdated,
    needsPublishedDecision: shouldSkipSync
  }
}
