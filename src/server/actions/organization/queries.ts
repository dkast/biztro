"use server"

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { unstable_cache as cache } from "next/cache"

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

export async function getOrganization(id: string) {
  return await cache(
    async () => {
      const org = await prisma.organization.findUnique({
        where: {
          id
        }
      })

      if (org?.banner) {
        org.banner = await getSignedUrl(
          R2,
          new GetObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: org.banner
          }),
          { expiresIn: 3600 * 24 }
        )
      }

      if (org?.logo) {
        org.logo = await getSignedUrl(
          R2,
          new GetObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: org.logo
          }),
          { expiresIn: 3600 * 24 }
        )
      }

      return org
    },
    [`organization-${id}`],
    {
      revalidate: 900,
      tags: [`organization-${id}`]
    }
  )()
}
