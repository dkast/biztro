"use server"

import { unstable_cache as cache } from "next/cache"

import prisma from "@/lib/prisma"
import { env } from "@/env.mjs"

export async function getOrganization(id: string) {
  return await cache(
    async () => {
      const org = await prisma.organization.findUnique({
        where: {
          id
        }
      })

      if (org?.banner) {
        // org.banner = await getSignedUrl(
        //   R2,
        //   new GetObjectCommand({
        //     Bucket: env.R2_BUCKET_NAME,
        //     Key: org.banner
        //   }),
        //   { expiresIn: 3600 * 24 }
        // )
        org.banner = env.R2_CUSTOM_DOMAIN + "/" + org.banner
      }

      if (org?.logo) {
        // org.logo = await getSignedUrl(
        //   R2,
        //   new GetObjectCommand({
        //     Bucket: env.R2_BUCKET_NAME,
        //     Key: org.logo
        //   }),
        //   { expiresIn: 3600 * 24 }
        // )
        org.logo = env.R2_CUSTOM_DOMAIN + "/" + org.logo
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
