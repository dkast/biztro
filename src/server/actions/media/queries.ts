"use server"

import { cacheTag } from "next/cache"

import { getCurrentMembership } from "@/server/actions/user/queries"
import prisma from "@/lib/prisma"
import { MediaAssetScope } from "@/lib/types"
import { getCacheBustedImageUrl } from "@/lib/utils"
import { CACHE_TAGS } from "./constants"

export async function getUploadedBackgrounds() {
  "use cache: private"
  const membership = await getCurrentMembership()
  const organizationId = membership?.organizationId

  if (!organizationId) {
    return []
  }

  cacheTag(CACHE_TAGS.mediaBackgrounds(organizationId))

  const assets = await prisma.mediaAsset.findMany({
    where: {
      organizationId,
      scope: MediaAssetScope.OTHER,
      deletedAt: null,
      usages: {
        some: {
          field: {
            startsWith: "menu-background-"
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 20
  })

  return assets.map(asset => ({
    storageKey: asset.storageKey,
    url: getCacheBustedImageUrl(asset.storageKey, asset.updatedAt),
    createdAt: asset.createdAt
  }))
}

export async function getAllMediaAssets() {
  "use cache: private"
  const membership = await getCurrentMembership()
  const organizationId = membership?.organizationId

  if (!organizationId) {
    return []
  }

  cacheTag(CACHE_TAGS.mediaAssets(organizationId))

  const assets = await prisma.mediaAsset.findMany({
    where: {
      organizationId,
      deletedAt: null
    },
    include: {
      usages: {
        select: {
          entityType: true,
          entityId: true,
          field: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return assets.map(asset => ({
    id: asset.id,
    organizationId: asset.organizationId,
    storageKey: asset.storageKey,
    url: getCacheBustedImageUrl(asset.storageKey, asset.updatedAt),
    type: asset.type,
    scope: asset.scope,
    width: asset.width,
    height: asset.height,
    bytes: asset.bytes,
    contentType: asset.contentType,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
    usageCount: asset.usages.length,
    usages: asset.usages
  }))
}

export async function getMediaAssetCount() {
  "use cache: private"
  const membership = await getCurrentMembership()
  const organizationId = membership?.organizationId

  if (!organizationId) {
    return 0
  }

  cacheTag(CACHE_TAGS.mediaCount(organizationId))

  return await prisma.mediaAsset.count({
    where: {
      organizationId,
      deletedAt: null
    }
  })
}
