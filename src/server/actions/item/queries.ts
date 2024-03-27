import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { unstable_cache as cache } from "next/cache"
import { cookies } from "next/headers"

import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"
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

export async function getMenuItems() {
  const currentOrg = cookies().get(appConfig.cookieOrg)?.value
  return cache(
    async () => {
      return await prisma.menuItem.findMany({
        where: {
          organizationId: currentOrg
        }
      })
    },
    [`menuItems-${currentOrg}`],
    {
      revalidate: 900,
      tags: [`menuItems-${currentOrg}`]
    }
  )()
}

export async function getMenuItemById(id: string) {
  return cache(
    async () => {
      const item = await prisma.menuItem.findUnique({
        where: {
          id
        },
        include: {
          category: true
        }
      })

      if (item?.image) {
        item.image = await getSignedUrl(
          R2,
          new GetObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: item.image
          }),
          { expiresIn: 3600 * 24 }
        )
      }

      return item
    },
    [`menuItem-${id}`],
    {
      revalidate: 900,
      tags: [`menuItem-${id}`]
    }
  )()
}

export async function getCategories() {
  const currentOrg = cookies().get(appConfig.cookieOrg)?.value
  return await cache(
    async () => {
      return await prisma.category.findMany({
        where: {
          organizationId: currentOrg
        }
      })
    },
    [`categories-${currentOrg}`],
    {
      revalidate: 900,
      tags: [`categories-${currentOrg}`]
    }
  )()
}
