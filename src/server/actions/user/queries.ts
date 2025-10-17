"use server"

// removed unstable_cache usage — functions now fetch directly
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { SubscriptionStatus } from "@/lib/types"
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
  const member = await prisma.member.findFirst({
    where: {
      userId
    },
    include: {
      organization: true
    }
  })

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
  try {
    const { role } = await auth.api.getActiveMemberRole({
      headers: await headers()
    })

    return role
  } catch (err) {
    console.error("Failed to get current membership role", err)
    return null
  }
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

  const subscriptions = await auth.api.listActiveSubscriptions({
    query: { referenceId: org?.id },
    headers: await headers()
  })

  const activeSubscription = subscriptions.find(
    sub => sub.status === "active" || sub.status === "trialing"
  )

  // Update the plan in the organization record if it differs from the subscription plan, if the status is sponsored,
  // it means the organization is on a sponsored PRO plan
  if (
    org &&
    activeSubscription &&
    org.plan?.toUpperCase() !== activeSubscription.plan?.toUpperCase() &&
    org.status !== SubscriptionStatus.SPONSORED
  ) {
    try {
      await auth.api.updateOrganization({
        body: {
          data: {
            plan: activeSubscription.plan.toUpperCase(),
            status: activeSubscription.status.toUpperCase()
          },
          organizationId: org.id
        },
        headers: await headers()
      })
    } catch (error) {
      console.error("Failed to update organization plan", error)
    }
  }

  return (
    activeSubscription?.plan.toUpperCase() === "PRO" ||
    org?.status === SubscriptionStatus.SPONSORED
  )
}

export async function safeHasPermission(
  opts: Parameters<typeof auth.api.hasPermission>[0]
) {
  try {
    // ensure headers are provided if not included
    if (!opts.headers) {
      opts.headers = await headers()
    }

    const result = await auth.api.hasPermission(opts)
    return result
  } catch (err) {
    console.error("auth.api.hasPermission failed:", err)
    return null
  }
}

export async function isInviteEnabled(email?: string | null) {
  const normalizedEmail = email?.trim()?.toLowerCase()

  if (!normalizedEmail) {
    return false
  }

  const invite = await prisma.invite.findFirst({
    where: {
      email: {
        equals: normalizedEmail
      },
      enabled: true
    }
  })

  return Boolean(invite?.enabled)
}
