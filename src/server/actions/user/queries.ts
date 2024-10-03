"use server"

import { unstable_cache as cache } from "next/cache"
import { cookies } from "next/headers"

import { appConfig } from "@/app/config"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { env } from "@/env.mjs"

// Get current organization for the user
export async function getCurrentOrganization() {
  const currentOrg = cookies().get(appConfig.cookieOrg)?.value

  if (currentOrg) {
    // return await cache(
    //   async () => {
    const org = await prisma.organization.findUnique({
      where: {
        id: currentOrg
      }
    })

    if (org?.banner) {
      org.banner = `${env.R2_CUSTOM_DOMAIN}/${org.banner}`
    }

    if (org?.logo) {
      org.logo = `${env.R2_CUSTOM_DOMAIN}/${org.logo}`
    }

    return org
    //   },
    //   [`organization-${currentOrg}`],
    //   {
    //     revalidate: 900,
    //     tags: [`organization-${currentOrg}`]
    //   }
    // )()
  } else {
    // Return first organization for the user
    const user = await getCurrentUser()

    console.log("current user", user)
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

export const getCurrentMembership = async () => {
  const user = await getCurrentUser()
  const currentOrg = cookies().get(appConfig.cookieOrg)?.value

  return await prisma.membership.findFirst({
    where: {
      userId: user?.id,
      organizationId: currentOrg
    },
    include: {
      organization: {
        select: {
          name: true,
          subdomain: true
        }
      }
    }
  })
}

export const getUserMemberships = async () => {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  return await cache(
    async () => {
      const memberships = await prisma.membership.findMany({
        where: {
          userId: user.id,
          isActive: true
        },
        include: {
          organization: true
        },
        orderBy: {
          organization: {
            name: "asc"
          }
        }
      })

      memberships.forEach(membership => {
        if (membership.organization.logo) {
          membership.organization.logo = `${env.R2_CUSTOM_DOMAIN}/${membership.organization.logo}`
        }
      })

      return memberships
    },
    [`memberships-${user.id}`],
    {
      revalidate: 900,
      tags: [`memberships-${user.id}`]
    }
  )()
}

export const getInviteByToken = async (token: string) => {
  return await prisma.teamInvite.findUnique({
    where: {
      token
    },
    select: {
      id: true,
      email: true,
      expiresAt: true,
      organizationId: true,
      status: true,
      organization: {
        select: {
          name: true,
          subdomain: true
        }
      }
    }
  })
}
