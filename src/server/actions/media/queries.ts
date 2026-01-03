"use server"

import { cacheTag } from "next/cache"

import { getCurrentMembership } from "@/server/actions/user/queries"
import prisma from "@/lib/prisma"
import { MediaAssetScope } from "@/lib/types"
import { getCacheBustedImageUrl } from "@/lib/utils"

export async function getUploadedBackgrounds() {
  "use cache: private"
  const membership = await getCurrentMembership()
  const organizationId = membership?.organizationId

  if (!organizationId) {
    return []
  }

  cacheTag(`media-backgrounds-${organizationId}`)

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
