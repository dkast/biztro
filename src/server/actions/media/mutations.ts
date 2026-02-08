"use server"

import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { revalidateTag } from "next/cache"
import { z } from "zod/v4"

import { authMemberActionClient } from "@/lib/safe-actions"
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

export const deleteMediaAsset = authMemberActionClient
  .inputSchema(
    z.object({
      assetId: z.string()
    })
  )
  .action(async ({ parsedInput: { assetId }, ctx: { member } }) => {
    const organizationId = member.organizationId

    if (!organizationId) {
      return {
        failure: {
          reason: "No se pudo obtener la organización actual"
        }
      }
    }

    // Get the asset to verify ownership and get storage key
    const asset = await prisma.mediaAsset.findFirst({
      where: {
        id: assetId,
        organizationId
      },
      include: {
        usages: true
      }
    })

    if (!asset) {
      return {
        failure: {
          reason: "Recurso multimedia no encontrado"
        }
      }
    }

    // Check if asset is in use
    if (asset.usages.length > 0) {
      return {
        failure: {
          reason:
            "No se puede eliminar un recurso multimedia que está en uso. Por favor, elimínelo de todas las ubicaciones primero."
        }
      }
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
    revalidateTag(CACHE_TAGS.mediaAssets(organizationId), "max")
    revalidateTag(CACHE_TAGS.mediaCount(organizationId), "max")

    return { success: true }
  })
