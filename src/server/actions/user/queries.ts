"use server"

import { unstable_cache as cache } from "next/cache"
import { cookies, headers } from "next/headers"

import { appConfig } from "@/app/config"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { env } from "@/env.mjs"

// Get current organization for the user
export async function getCurrentOrganization() {
  try {
    const currentOrg = await auth.api.getFullOrganization({
      headers: await headers()
    })

    if (currentOrg?.banner) {
      currentOrg.banner = `${env.R2_CUSTOM_DOMAIN}/${currentOrg.banner}`
    }

    if (currentOrg?.logo) {
      currentOrg.logo = `${env.R2_CUSTOM_DOMAIN}/${currentOrg.logo}`
    }

    return currentOrg
  } catch (err) {
    console.error("Failed to get current organization", err)
    return null
  }
}

export async function getActiveOrganization(userId: string) {
  console.log("Fetching active organization for user:", userId)
  const member = await prisma.member.findFirst({
    where: {
      userId
    },
    include: {
      organization: true
    }
  })

  // console.log("Member:", member)

  console.log("Current Organization:", member?.organization)

  // DEBUG: Count the number of records for member and organization tables
  // const memberCount = await prisma.member.count()
  // const organizationCount = await prisma.organization.count()
  // console.log(
  //   `Member count: ${memberCount}, Organization count: ${organizationCount}`
  // )

  return member?.organization
}

export async function hasOrganizations(): Promise<number> {
  try {
    const data = await auth.api.listOrganizations({
      headers: await headers()
    })
    if (!Array.isArray(data)) return 0
    return data.length
  } catch (err) {
    console.error("Failed to list organizations", err)
    return 0
  }
}

export const getMembers = async () => {
  const currentOrg = (await cookies()).get(appConfig.cookieOrg)?.value

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
  const currentOrg = (await cookies()).get(appConfig.cookieOrg)?.value

  return await prisma.membership.findFirst({
    where: {
      userId: user?.id,
      organizationId: currentOrg
    },
    include: {
      organization: {
        select: {
          name: true,
          slug: true
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
          slug: true
        }
      }
    }
  })
}

export async function isProMember() {
  const org = await getCurrentOrganization()
  return org?.plan === "PRO"
}
