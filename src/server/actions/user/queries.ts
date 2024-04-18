"use server"

import { unstable_cache as cache } from "next/cache"
import { cookies } from "next/headers"

import { appConfig } from "@/app/config"
import { assignOrganization } from "@/server/actions/user/mutations"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { env } from "@/env.mjs"

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

        if (org?.banner) {
          org.banner = env.R2_CUSTOM_DOMAIN + "/" + org.banner
        }

        if (org?.logo) {
          org.logo = env.R2_CUSTOM_DOMAIN + "/" + org.logo
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

    console.log("user", user)
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

    assignOrganization(appConfig.cookieOrg, membership.organizationId)

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
