"use server"

// removed unstable_cache usage — functions now fetch directly
import { cacheLife, cacheTag } from "next/cache"
import { headers } from "next/headers"
import * as Sentry from "@sentry/nextjs"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { SubscriptionStatus } from "@/lib/types"
import { getCacheBustedImageUrl } from "@/lib/utils"

// Get current organization for the user
export async function getCurrentOrganization() {
  "use cache: private"
  cacheLife({ stale: 60 })

  try {
    const currentOrg = await auth.api.getFullOrganization({
      headers: await headers()
    })

    if (!currentOrg) {
      return null
    }
    cacheTag(`organization-${currentOrg.id}`)

    // updatedAt is now available from better-auth API response
    const updatedAt = currentOrg.updatedAt
      ? new Date(currentOrg.updatedAt)
      : new Date()

    if (currentOrg?.banner) {
      currentOrg.banner = getCacheBustedImageUrl(currentOrg.banner, updatedAt)
    }

    if (currentOrg?.logo) {
      currentOrg.logo = getCacheBustedImageUrl(currentOrg.logo, updatedAt)
    }

    return currentOrg
  } catch (err) {
    Sentry.captureException(err, {
      tags: { section: "organization" }
    })
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
  "use cache: private"
  cacheTag("organizations-list")
  cacheLife({ stale: 60 })

  try {
    const data = await auth.api.listOrganizations({
      headers: await headers()
    })
    if (!Array.isArray(data)) return 0
    return data.length
  } catch (err) {
    Sentry.captureException(err, {
      tags: { section: "organization" }
    })
    return 0
  }
}

export const getMembers = async (organizationId: string) => {
  "use cache: private"
  cacheTag(`organization-${organizationId}-members`)
  cacheLife({ stale: 60 })

  if (!organizationId) {
    return []
  }

  // Direct fetch without Next.js unstable cache wrapper
  const members = await auth.api.listMembers({
    headers: await headers()
  })

  return members
}

export const getCurrentMembership = async () => {
  "use cache: private"
  cacheLife({ stale: 60 })

  try {
    const member = await auth.api.getActiveMember({
      headers: await headers()
    })

    if (member?.id) {
      cacheTag(`membership-${member.id}`)
    }
    cacheTag("membership-current")

    return member
  } catch (err) {
    Sentry.captureException(err, {
      tags: { section: "membership" }
    })
    return null
  }
}

export const getCurrentMembershipRole = async () => {
  "use cache: private"
  cacheLife({ stale: 60 })

  try {
    const requestHeaders = await headers()
    const { role } = await auth.api.getActiveMemberRole({
      headers: requestHeaders
    })

    cacheTag("membership-current-role")

    return role
  } catch (err) {
    Sentry.captureException(err, {
      tags: { section: "membership" }
    })
    return null
  }
}

export const getInviteByToken = async (token: string) => {
  "use cache: private"
  cacheTag(`invitation-${token}`)
  cacheLife({ stale: 60 })

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
    Sentry.captureException(err, {
      tags: { section: "invitation" },
      extra: { token }
    })
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
  "use cache: private"
  cacheLife({ stale: 60 })

  const org = await getCurrentOrganization()

  if (!org) {
    return false
  }

  cacheTag(`organization-${org.id}-subscription`)

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
      Sentry.captureException(error, {
        tags: { section: "subscription" },
        extra: { organizationId: org.id, plan: activeSubscription.plan }
      })
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
  "use cache: private"
  cacheLife({ stale: 30 })

  if (!opts) {
    Sentry.captureMessage("safeHasPermission called without opts", "error")
    return null
  }

  try {
    const requestHeaders = opts.headers ?? (await headers())
    const permissions = opts.body?.permissions ?? {}
    const normalizedPermissions = Object.entries(permissions)
      .map(([resource, actions]) => {
        if (!Array.isArray(actions)) {
          return `${resource}:${JSON.stringify(actions)}`
        }

        const sortedActions = [...actions].sort()
        return `${resource}:${sortedActions.join("|")}`
      })
      .sort()
      .join(";")

    cacheTag("permissions-all")
    cacheTag(
      normalizedPermissions
        ? `permissions-${normalizedPermissions}`
        : "permissions-default"
    )

    const callOpts = {
      ...opts,
      headers: requestHeaders
    } as Parameters<typeof auth.api.hasPermission>[0]

    const result = await auth.api.hasPermission(callOpts)
    return result
  } catch (err) {
    Sentry.captureException(err, {
      tags: { section: "permissions" }
    })
    return null
  }
}

export async function isWaitlistEnabled(email?: string | null) {
  const normalizedEmail = email?.trim()?.toLowerCase()

  if (!normalizedEmail) {
    return false
  }

  const waitlist = await prisma.waitlist.findFirst({
    where: {
      email: {
        equals: normalizedEmail
      },
      enabled: true
    }
  })

  return Boolean(waitlist?.enabled)
}
