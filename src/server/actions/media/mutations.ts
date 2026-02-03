"use server"

import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { revalidateTag } from "next/cache"

import { getCurrentMembership } from "@/server/actions/user/queries"
import { actionClient } from "@/lib/action-client"
import prisma from "@/lib/prisma"
import { env } from "@/env.mjs"

import { CACHE_TAGS } from "./constants"

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_KEY_ID
  }
})

export const deleteMediaAsset = actionClient
  .schema(async schema => {
    return schema.object({
      assetId: schema.string()
    })
  })
  .action(async ({ parsedInput: { assetId } }) => {
    const membership = await getCurrentMembership()
    const organizationId = membership?.organizationId

    if (!organizationId) {
      throw new Error("Unauthorized")
    }

    // Get the asset to verify ownership and get storage key
    const asset = await prisma.mediaAsset.findUnique({
      where: {
        id: assetId,
        organizationId
      },
      include: {
        usages: true
      }
    })

    if (!asset) {
      throw new Error("Media asset not found")
    }

    // Check if asset is in use
    if (asset.usages.length > 0) {
      throw new Error(
        "Cannot delete media asset that is currently in use. Please remove it from all locations first."
      )
    }

    // Delete from R2
    try {
      await R2.send(
        new DeleteObjectCommand({
          Bucket: env.R2_BUCKET_NAME,
          Key: asset.storageKey
        })
      )
    } catch (error) {
      console.error("Error deleting from R2:", error)
      // Continue with database deletion even if R2 delete fails
    }

    // Delete from database
    await prisma.mediaAsset.delete({
      where: {
        id: assetId
      }
    })

    // Revalidate cache
    revalidateTag(CACHE_TAGS.mediaAssets(organizationId))
    revalidateTag(CACHE_TAGS.mediaCount(organizationId))

    return { success: true }
  })
