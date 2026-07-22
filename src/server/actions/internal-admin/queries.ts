"use server"

import prisma from "@/lib/prisma"
import { requireInternalAdmin } from "./guards"

const PAGE_LIMIT = 20

export type InternalOrg = {
  id: string
  name: string
  slug: string | null
  customDomain: string | null
  status: string
  plan: string
  createdAt: Date
  _count: { members: number; menus: number; menuItems: number }
  effectiveEntitlement: "BASIC" | "PAID_PRO" | "SPONSORED"
  hasActiveStripeSubscription: boolean
}

export type InternalUser = {
  id: string
  name: string
  email: string | null
  image: string | null
  role: string | null
  banned: boolean | null
  banReason: string | null
  createdAt: Date
  _count: { members: number }
}

export type InternalWaitlistEntry = {
  id: string
  email: string
  enabled: boolean
}

export type PaginatedResult<T> = {
  items: T[]
  total: number
  limit: number
  offset: number
}

export async function listInternalOrganizations({
  search,
  plan,
  status,
  limit = PAGE_LIMIT,
  offset = 0
}: {
  search?: string
  plan?: string
  status?: string
  limit?: number
  offset?: number
}): Promise<PaginatedResult<InternalOrg>> {
  await requireInternalAdmin()

  const where = {
    ...(search
      ? {
          OR: [{ name: { contains: search } }, { slug: { contains: search } }]
        }
      : {}),
    ...(plan ? { plan } : {}),
    ...(status ? { status } : {})
  }

  const [items, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        customDomain: true,
        status: true,
        plan: true,
        createdAt: true,
        _count: { select: { members: true, menus: true, menuItems: true } }
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset
    }),
    prisma.organization.count({ where })
  ])

  const subscriptions = items.length
    ? await prisma.subscription.findMany({
        where: {
          referenceId: { in: items.map(item => item.id) },
          status: { in: ["active", "trialing"] }
        },
        select: { referenceId: true, plan: true }
      })
    : []
  const activeSubscriptions = new Map(
    subscriptions.map(subscription => [
      subscription.referenceId,
      { isPro: subscription.plan.toUpperCase() === "PRO" }
    ])
  )

  return {
    items: items.map(item => {
      const activeSubscription = activeSubscriptions.get(item.id)
      const hasActiveStripeSubscription = activeSubscription !== undefined
      const effectiveEntitlement =
        item.status === "SPONSORED"
          ? "SPONSORED"
          : activeSubscription?.isPro
            ? "PAID_PRO"
            : "BASIC"

      return {
        ...item,
        effectiveEntitlement,
        hasActiveStripeSubscription
      }
    }),
    total,
    limit,
    offset
  }
}

export async function listInternalUsers({
  search,
  role,
  banned,
  limit = PAGE_LIMIT,
  offset = 0
}: {
  search?: string
  role?: string
  banned?: boolean
  limit?: number
  offset?: number
}): Promise<PaginatedResult<InternalUser>> {
  await requireInternalAdmin()

  const where = {
    ...(search
      ? {
          OR: [{ name: { contains: search } }, { email: { contains: search } }]
        }
      : {}),
    ...(role !== undefined && role !== "" ? { role } : {}),
    ...(banned !== undefined ? { banned } : {})
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        banned: true,
        banReason: true,
        createdAt: true,
        _count: { select: { members: true } }
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset
    }),
    prisma.user.count({ where })
  ])

  return { items, total, limit, offset }
}

export async function listWaitlistEntries({
  search,
  enabled,
  limit = PAGE_LIMIT,
  offset = 0
}: {
  search?: string
  enabled?: boolean
  limit?: number
  offset?: number
}): Promise<PaginatedResult<InternalWaitlistEntry>> {
  await requireInternalAdmin()

  const where = {
    ...(search ? { email: { contains: search } } : {}),
    ...(enabled !== undefined ? { enabled } : {})
  }

  const [items, total] = await Promise.all([
    prisma.waitlist.findMany({
      where,
      select: { id: true, email: true, enabled: true },
      orderBy: { id: "desc" },
      take: limit,
      skip: offset
    }),
    prisma.waitlist.count({ where })
  ])

  return { items, total, limit, offset }
}

// ---------------------------------------------------------------------------
// Detail queries
// ---------------------------------------------------------------------------

export async function getInternalOrgDetail(id: string) {
  await requireInternalAdmin()

  return prisma.organization.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      },
      _count: {
        select: { menus: true, menuItems: true, sales: true }
      }
    }
  })
}

export async function getInternalUserDetail(id: string) {
  await requireInternalAdmin()

  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      banned: true,
      banReason: true,
      banExpires: true,
      createdAt: true,
      updatedAt: true,
      members: {
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              plan: true,
              status: true
            }
          }
        }
      },
      sessions: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          ipAddress: true,
          userAgent: true,
          impersonatedBy: true
        }
      }
    }
  })
}

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

export type InternalAuditLog = {
  id: string
  actorId: string
  targetUserId: string | null
  action: string
  payload: string | null
  ipAddress: string | null
  createdAt: Date
}

export async function listAuditLogs({
  actorId,
  targetUserId,
  limit = PAGE_LIMIT,
  offset = 0
}: {
  actorId?: string
  targetUserId?: string
  limit?: number
  offset?: number
}): Promise<PaginatedResult<InternalAuditLog>> {
  await requireInternalAdmin()

  const where = {
    ...(actorId ? { actorId } : {}),
    ...(targetUserId ? { targetUserId } : {})
  }

  const [items, total] = await Promise.all([
    prisma.internalAdminAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset
    }),
    prisma.internalAdminAuditLog.count({ where })
  ])

  return { items, total, limit, offset }
}
