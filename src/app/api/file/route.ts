import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { revalidateTag } from "next/cache"
import { headers } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

import { isProMember } from "@/server/actions/user/queries"
import { CACHE_TAGS } from "@/server/actions/media/constants"
import { appConfig } from "@/app/config"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
  ImageType,
  MediaAssetScope,
  MediaAssetType,
  MediaUsageEntityType
} from "@/lib/types"
import { env } from "@/env.mjs"

// Create an Cloudflare R2 service client object
const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_KEY_ID
  }
})

export async function POST(req: NextRequest) {
  const {
    organizationId: requestedOrganizationId,
    imageType,
    objectId,
    contentType
  } = await req.json()

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*"
  }

  const requestHeaders = await headers()
  const activeMember = await auth.api.getActiveMember({
    headers: requestHeaders
  })
  const activeOrganizationId = activeMember?.organizationId

  if (!activeOrganizationId) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: corsHeaders
    })
  }

  if (
    requestedOrganizationId &&
    requestedOrganizationId !== activeOrganizationId
  ) {
    return new NextResponse("Invalid organization", {
      status: 403,
      headers: corsHeaders
    })
  }

  const organizationId = activeOrganizationId

  // Use deterministic storage keys to enable overwriting and prevent orphaned files
  let storageKey: string
  let assetScope: MediaAssetScope
  let entityType: MediaUsageEntityType
  let entityId: string
  let field: string
  let requiresProFeature = false

  switch (imageType) {
    case ImageType.LOGO:
      storageKey = `orgs/${organizationId}/branding/logo`
      assetScope = MediaAssetScope.ORG_LOGO
      entityType = MediaUsageEntityType.ORGANIZATION
      entityId = organizationId
      field = "logo"
      break
    case ImageType.BANNER:
      storageKey = `orgs/${organizationId}/branding/banner`
      assetScope = MediaAssetScope.ORG_BANNER
      entityType = MediaUsageEntityType.ORGANIZATION
      entityId = organizationId
      field = "banner"
      break
    case ImageType.MENUITEM:
      if (!objectId) {
        return new NextResponse("Menu item id is required", {
          status: 400,
          headers: corsHeaders
        })
      }
      storageKey = `orgs/${organizationId}/menu-items/${objectId}/image`
      assetScope = MediaAssetScope.MENU_ITEM_IMAGE
      entityType = MediaUsageEntityType.MENU_ITEM
      entityId = objectId
      field = "image"
      break
    case ImageType.MENU_BACKGROUND: {
      if (!objectId) {
        return new NextResponse("Menu id is required", {
          status: 400,
          headers: corsHeaders
        })
      }

      // Removed DB lookup: use the active member's organizationId for validation
      storageKey = `orgs/${organizationId}/menus/${objectId}/background`
      assetScope = MediaAssetScope.OTHER
      entityType = MediaUsageEntityType.ORGANIZATION
      entityId = organizationId
      field = `menu-background-${objectId}`
      requiresProFeature = false // Set to true if this becomes a Pro feature
      break
    }
    default:
      return new NextResponse("Invalid imageType", {
        status: 400,
        headers: corsHeaders
      })
  }

  if (requiresProFeature) {
    const proMember = await isProMember()
    if (!proMember) {
      return new NextResponse("Pro plan required", {
        status: 403,
        headers: corsHeaders
      })
    }
  }

  // Check media limit for free tier users
  const proMember = await isProMember()
  if (!proMember) {
    // Check if this is a new asset (not an update)
    const existingAsset = await prisma.mediaAsset.findUnique({
      where: { storageKey }
    })

    if (!existingAsset) {
      // Count total media assets for this organization
      const assetCount = await prisma.mediaAsset.count({
        where: {
          organizationId,
          deletedAt: null
        }
      })

      if (assetCount >= appConfig.mediaLimit) {
        return new NextResponse(
          `Límite de medios alcanzado. El nivel gratuito está limitado a ${appConfig.mediaLimit} imágenes.`,
          {
            status: 403,
            headers: corsHeaders
          }
        )
      }
    }
  }

  // Create a signed URL for a PUT request
  const signedUrl = await getSignedUrl(
    R2,
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: storageKey,
      ContentType: contentType as string
    }),
    { expiresIn: 3600 }
  )

  // Use transaction to ensure atomic operations
  await prisma.$transaction(async tx => {
    // Create or update MediaAsset record
    const asset = await tx.mediaAsset.upsert({
      where: { storageKey },
      create: {
        organizationId,
        storageKey,
        type: MediaAssetType.IMAGE,
        scope: assetScope,
        contentType: contentType as string
      },
      update: {
        contentType: contentType as string,
        updatedAt: new Date()
      }
    })

    // Create or update MediaUsage record
    await tx.mediaUsage.upsert({
      where: {
        assetId_entityType_entityId_field: {
          assetId: asset.id,
          entityType,
          entityId,
          field
        }
      },
      create: {
        assetId: asset.id,
        entityType,
        entityId,
        field
      },
      update: {
        updatedAt: new Date()
      }
    })

    // Update the entity's storage key field
    switch (imageType) {
      case ImageType.LOGO:
        await tx.organization.update({
          where: { id: organizationId as string },
          data: { logo: storageKey, logoAssetId: asset.id }
        })
        break
      case ImageType.BANNER:
        await tx.organization.update({
          where: { id: organizationId as string },
          data: { banner: storageKey, bannerAssetId: asset.id }
        })
        break
      case ImageType.MENUITEM:
        await tx.menuItem.update({
          where: { id: objectId as string },
          data: { image: storageKey, imageAssetId: asset.id }
        })
        break
      default:
        // Should not reach here due to earlier validation
        break
    }
  })

  // Refresh relevant cache tags
  // Note: Cache tags are only refreshed after successful transaction
  switch (imageType) {
    case ImageType.LOGO:
    case ImageType.BANNER:
      // Organization branding changed
      revalidateTag(`organization-${organizationId}`, "max")
      break
    case ImageType.MENUITEM:
      // Menu item image changed
      revalidateTag(`menu-item-${objectId}`, "max")
      break
    case ImageType.MENU_BACKGROUND:
      revalidateTag(`organization-${organizationId}`, "max")
      revalidateTag(CACHE_TAGS.mediaBackgrounds(organizationId), "max")
      break
    default:
      // No cache tag to revalidate for unknown imageType
      break
  }

  // Always revalidate media cache tags when a new asset is created
  revalidateTag(CACHE_TAGS.mediaAssets(organizationId), "max")
  revalidateTag(CACHE_TAGS.mediaCount(organizationId), "max")

  // Return the signed URL to the client for a PUT request
  // Also return the storageKey so clients can persist it in serialData
  // @see https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/#generate-presigned-urls
  return NextResponse.json(
    { url: signedUrl, method: "PUT", storageKey },
    {
      headers: corsHeaders
    }
  )
}

/**
 * Retrieve a list of signed URLs for a GET request
 * @see https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/#generate-presigned-urls
 */
// export async function GET(req: NextRequest) {
//   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//   const searchParams = req.nextUrl.searchParams
//   const organizationId = searchParams.get("orgId")
//   const itemId = searchParams.get("itemId")

//   if (!organizationId || !itemId) {
//     return new NextResponse("Missing organizationId or itemId", {
//       status: 400
//     })
//   }

//   const files = await prisma.inspectionItemFile.findMany({
//     where: {
//       organizationId: organizationId as string,
//       inspectionItemId: itemId as string
//     }
//   })

//   const signedUrls = await Promise.all(
//     files.map(file => {
//       return getSignedUrl(
//         R2,
//         new GetObjectCommand({
//           Bucket: env.R2_BUCKET_NAME,
//           Key: file.fileUrl
//         }),
//         { expiresIn: 3600 }
//       )
//     })
//   )
//   return NextResponse.json(signedUrls)
// }
