"use server"

// removed unstable_cache usage — functions now fetch directly
import { headers } from "next/headers"

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
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    return []
  }

  // Direct fetch without Next.js unstable cache wrapper
  const members = await auth.api.listMembers({
    headers: await headers()
  })

  return members
}

export const getCurrentMembership = async () => {
  try {
    const member = await auth.api.getActiveMember({
      headers: await headers()
    })

    return member
  } catch (err) {
    console.error("Failed to get current membership", err)
    return null
  }
}

export const getCurrentMembershipRole = async () => {
  const { role } = await auth.api.getActiveMemberRole({
    headers: await headers()
  })

  return role
}

export const getUserMemberships = async () => {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

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
}

export const getInviteByToken = async (token: string) => {
  try {
    const data = await auth.api.getInvitation({
      query: { id: token },
      headers: await headers()
    })

    return {
      data,
      error: null
    }
  } catch (err) {
    console.error("Failed to get invitation by token", err)
    // If err has a message property, return it; otherwise stringify
    if (err && typeof err === "object" && "message" in err) {
      return {
        data: null,
        error: (err as Error).message
      }
    }

    try {
      return {
        data: null,
        error: String(err)
      }
    } catch {
      return {
        data: null,
        error: "An unknown error occurred"
      }
    }
  }
}

export async function isProMember() {
  const org = await getCurrentOrganization()
  return org?.plan === "PRO"
}
