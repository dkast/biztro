import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { NextResponse, type NextRequest } from "next/server"

import prisma from "@/lib/prisma"
import { ImageType } from "@/lib/types"
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
  const { organizationId, imageType, objectId, filename, contentType } =
    await req.json()

  // Use deterministic storage keys to enable overwriting and prevent orphaned files
  let storageKey: string
  switch (imageType) {
    case ImageType.LOGO:
      storageKey = `orgs/${organizationId}/branding/logo`
      break
    case ImageType.BANNER:
      storageKey = `orgs/${organizationId}/branding/banner`
      break
    case ImageType.MENUITEM:
      storageKey = `orgs/${organizationId}/menu-items/${objectId}/image`
      break
    default:
      return new NextResponse("Invalid imageType", { status: 400 })
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

  // Save storage key to database so we can retrieve it later
  switch (imageType) {
    case ImageType.LOGO:
      // Update organization using Prisma
      await prisma.organization.update({
        where: { id: organizationId as string },
        data: { logo: storageKey }
      })
      break
    case ImageType.BANNER:
      // Update organization using Prisma
      await prisma.organization.update({
        where: { id: organizationId as string },
        data: { banner: storageKey }
      })
      break
    case ImageType.MENUITEM:
      await prisma.menuItem.update({
        where: { id: objectId as string },
        data: { image: storageKey }
      })
      break
    default:
      return new NextResponse("Invalid imageType", { status: 400 })
  }

  // Return the signed URL to the client for a PUT request
  // @see https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/#generate-presigned-urls
  return NextResponse.json(
    { url: signedUrl, method: "PUT" },
    {
      headers: {
        "Access-Control-Allow-Origin": "*" // Required for CORS support to work
      }
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
