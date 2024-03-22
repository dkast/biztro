"use server"

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { unstable_cache as cache } from "next/cache"
import { cookies } from "next/headers"

import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
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

// Get current organization for the user
export async function getCurrentOrganization() {
  const currentOrg = cookies().get(appConfig.cookieOrg)?.value

  if (currentOrg) {
    return await cache(
      async () => {
        const org = await prisma.organization.findUnique({
          where: {
            id: currentOrg
          }
        })

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

        return org
      },
      [`organization-${currentOrg}`],
      {
        revalidate: 900,
        tags: [`organization-${currentOrg}`]
      }
    )()
  } else {
    // Return first organization for the user
    const user = await getCurrentUser()

    // console.log("user", user)
    const membership = await prisma.membership.findFirst({
      where: {
        userId: user?.id
      },
      include: {
        organization: true
      }
    })

    if (!membership) {
      return null
    }
    // Set the current organization
    cookies().set(appConfig.cookieOrg, membership.organizationId, {
      maxAge: 60 * 60 * 24 * 365
    })

    return membership.organization
  }
}

export const getMembers = async () => {
  const currentOrg = cookies().get(appConfig.cookieOrg)?.value

  if (!currentOrg) {
    return []
  }

  return await cache(
    async () => {
      const members = await prisma.membership.findMany({
        where: {
          organizationId: currentOrg
        },
        include: {
          user: true
        }
      })

      return members
    },
    [`members-${currentOrg}`],
    {
      revalidate: 900,
      tags: [`members-${currentOrg}`]
    }
  )()
}
