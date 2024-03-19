"use server"

import { appConfig } from "@/app/config"
import { unstable_cache as cache } from "next/cache"
import { cookies } from "next/headers"

import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"

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
