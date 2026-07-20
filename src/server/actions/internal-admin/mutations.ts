"use server"

import * as Sentry from "@sentry/nextjs"
import { updateTag } from "next/cache"
import { headers } from "next/headers"
import { z } from "zod/v4"

import { auth } from "@/lib/auth"
import { parseRoles, ROLES } from "@/lib/auth-admin-access"
import prisma from "@/lib/prisma"
import { Plan, SubscriptionStatus } from "@/lib/types/billing"
import {
  internalAdminActionClient,
  internalSuperuserActionClient
} from "./guards"

// ---------------------------------------------------------------------------
// Audit logging is part of each privileged mutation; fail closed if it cannot
// be persisted so successful responses never hide an incomplete audit trail.
// ---------------------------------------------------------------------------

async function writeAuditLog(data: {
  actorId: string
  targetUserId?: string
  action: string
  payload?: Record<string, unknown>
  ipAddress?: string
}) {
  try {
    await prisma.internalAdminAuditLog.create({
      data: {
        actorId: data.actorId,
        targetUserId: data.targetUserId ?? null,
        action: data.action,
        payload: data.payload ? JSON.stringify(data.payload) : null,
        ipAddress: data.ipAddress ?? null
      }
    })
  } catch (err) {
    Sentry.captureException(err, {
      tags: { section: "internal-admin-audit" },
      extra: { action: data.action, actorId: data.actorId }
    })
    throw new Error("No se pudo registrar la auditoría")
  }
}

// ---------------------------------------------------------------------------
// Organization entitlement mutations
// ---------------------------------------------------------------------------

async function getActiveStripeSubscription(organizationId: string) {
  return prisma.subscription.findFirst({
    where: {
      referenceId: organizationId,
      status: { in: ["active", "trialing", "ACTIVE", "TRIALING"] }
    },
    select: { plan: true, status: true }
  })
}

export const setOrganizationSponsored = internalAdminActionClient
  .inputSchema(z.object({ orgId: z.string().min(1) }))
  .action(async ({ parsedInput: { orgId }, ctx: { actorId, ipAddress } }) => {
    try {
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { id: true, plan: true, status: true }
      })
      if (!org) return { failure: { reason: "Organización no encontrada" } }

      const subscription = await getActiveStripeSubscription(orgId)
      if (subscription) {
        return {
          failure: {
            reason:
              "La suscripción activa se administra en Stripe y no puede convertirse manualmente en patrocinada"
          }
        }
      }
      await prisma.organization.update({
        where: { id: orgId },
        data: { plan: Plan.PRO, status: SubscriptionStatus.SPONSORED }
      })

      updateTag(`organization-${orgId}`)
      updateTag(`organization-${orgId}-subscription`)
      updateTag("organizations-list")
      updateTag("organization-current")
      updateTag("subscription-current")

      await writeAuditLog({
        actorId,
        action: "org.set-sponsored",
        payload: {
          orgId,
          before: { plan: org.plan, status: org.status },
          after: { plan: Plan.PRO, status: SubscriptionStatus.SPONSORED },
          ...(subscription != null ? { stripe: subscription } : {})
        },
        ipAddress
      })

      return { success: true }
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          section: "internal-admin-mutations",
          op: "setOrganizationSponsored"
        },
        extra: { orgId }
      })
      return { failure: { reason: "No se pudo actualizar la organización" } }
    }
  })

export const setOrganizationBasic = internalAdminActionClient
  .inputSchema(z.object({ orgId: z.string().min(1) }))
  .action(async ({ parsedInput: { orgId }, ctx: { actorId, ipAddress } }) => {
    try {
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { id: true, plan: true, status: true }
      })
      if (!org) return { failure: { reason: "Organización no encontrada" } }

      // Block downgrade if the org has an active Stripe subscription – admin
      // must cancel the subscription in Stripe first.
      const subscription = await getActiveStripeSubscription(orgId)
      if (subscription) {
        return {
          failure: {
            reason: `La organización tiene una suscripción activa de Stripe (${subscription.plan ?? "PRO"}). Cancela la suscripción antes de degradar el plan.`
          }
        }
      }

      await prisma.organization.update({
        where: { id: orgId },
        data: { plan: Plan.BASIC, status: SubscriptionStatus.ACTIVE }
      })

      updateTag(`organization-${orgId}`)
      updateTag(`organization-${orgId}-subscription`)
      updateTag("organizations-list")
      updateTag("organization-current")
      updateTag("subscription-current")

      await writeAuditLog({
        actorId,
        action: "org.set-basic",
        payload: {
          orgId,
          before: { plan: org.plan, status: org.status },
          after: { plan: Plan.BASIC, status: SubscriptionStatus.ACTIVE }
        },
        ipAddress
      })

      return { success: true }
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          section: "internal-admin-mutations",
          op: "setOrganizationBasic"
        },
        extra: { orgId }
      })
      return { failure: { reason: "No se pudo actualizar la organización" } }
    }
  })

// ---------------------------------------------------------------------------
// Role mutation – superuser-only; last-superuser protected
// ---------------------------------------------------------------------------

export const setUserRole = internalSuperuserActionClient
  .inputSchema(
    z.object({
      userId: z.string().min(1),
      role: z.enum(["user", "admin", "superuser"])
    })
  )
  .action(
    async ({ parsedInput: { userId, role }, ctx: { actorId, ipAddress } }) => {
      try {
        const target = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true }
        })
        if (!target) {
          return { failure: { reason: "Usuario no encontrado" } }
        }

        // Prevent demoting the last superuser, including self-demotion.
        if (
          role !== ROLES.SUPERUSER &&
          parseRoles(target.role).includes(ROLES.SUPERUSER)
        ) {
          const usersWithRoles = await prisma.user.findMany({
            where: { role: { not: null } },
            select: { role: true }
          })
          const superuserCount = usersWithRoles.filter(user =>
            parseRoles(user.role).includes(ROLES.SUPERUSER)
          ).length

          if (superuserCount <= 1) {
            return {
              failure: {
                reason:
                  "No se puede cambiar el rol del último superusuario del sistema"
              }
            }
          }
        }

        await auth.api.setRole({
          body: { userId, role },
          headers: await headers()
        })

        updateTag("permissions-all")

        await writeAuditLog({
          actorId,
          targetUserId: userId,
          action: "user.set-role",
          payload: { role },
          ipAddress
        })

        return { success: true }
      } catch (error) {
        Sentry.captureException(error, {
          tags: { section: "internal-admin-mutations", op: "setUserRole" },
          extra: { userId, role, actorId }
        })
        return {
          failure: {
            reason:
              error instanceof Error ? error.message : "Error al cambiar rol"
          }
        }
      }
    }
  )

// ---------------------------------------------------------------------------
// User ban / unban – delegated to Better Auth admin plugin
// ---------------------------------------------------------------------------

export const banInternalUser = internalAdminActionClient
  .inputSchema(
    z.object({
      userId: z.string().min(1),
      /** Human-readable ban reason shown to the user. */
      reason: z.string().max(500).optional(),
      /** Duration in seconds; omit for permanent ban. */
      banExpiresIn: z.number().int().positive().optional()
    })
  )
  .action(
    async ({
      parsedInput: { userId, reason, banExpiresIn },
      ctx: { actorId, actorRole, ipAddress }
    }) => {
      try {
        const target = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true }
        })
        if (!target) {
          return { failure: { reason: "Usuario no encontrado" } }
        }
        if (
          parseRoles(target.role).includes(ROLES.SUPERUSER) ||
          (actorRole !== ROLES.SUPERUSER &&
            parseRoles(target.role).includes(ROLES.ADMIN))
        ) {
          return {
            failure: {
              reason: "No tienes permiso para banear a este usuario"
            }
          }
        }

        await auth.api.banUser({
          body: { userId, banReason: reason, banExpiresIn },
          headers: await headers()
        })

        updateTag("permissions-all")

        await writeAuditLog({
          actorId,
          targetUserId: userId,
          action: "user.ban",
          payload: { reason, banExpiresIn },
          ipAddress
        })

        return { success: true }
      } catch (error) {
        Sentry.captureException(error, {
          tags: { section: "internal-admin-mutations", op: "banUser" },
          extra: { userId, actorId }
        })
        return {
          failure: {
            reason:
              error instanceof Error ? error.message : "Error al banear usuario"
          }
        }
      }
    }
  )

export const unbanInternalUser = internalAdminActionClient
  .inputSchema(z.object({ userId: z.string().min(1) }))
  .action(
    async ({
      parsedInput: { userId },
      ctx: { actorId, actorRole, ipAddress }
    }) => {
      try {
        const target = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true }
        })
        if (!target) {
          return { failure: { reason: "Usuario no encontrado" } }
        }
        if (
          parseRoles(target.role).includes(ROLES.SUPERUSER) ||
          (actorRole !== ROLES.SUPERUSER &&
            parseRoles(target.role).includes(ROLES.ADMIN))
        ) {
          return {
            failure: {
              reason: "No tienes permiso para administrar a este usuario"
            }
          }
        }

        await auth.api.unbanUser({
          body: { userId },
          headers: await headers()
        })

        updateTag("permissions-all")

        await writeAuditLog({
          actorId,
          targetUserId: userId,
          action: "user.unban",
          payload: {},
          ipAddress
        })

        return { success: true }
      } catch (error) {
        Sentry.captureException(error, {
          tags: { section: "internal-admin-mutations", op: "unbanUser" },
          extra: { userId, actorId }
        })
        return {
          failure: {
            reason:
              error instanceof Error
                ? error.message
                : "Error al desbanear usuario"
          }
        }
      }
    }
  )

// ---------------------------------------------------------------------------
// Waitlist mutations
// ---------------------------------------------------------------------------

export const activateWaitlistEntry = internalAdminActionClient
  .inputSchema(z.object({ id: z.string().min(1) }))
  .action(async ({ parsedInput: { id }, ctx: { actorId, ipAddress } }) => {
    try {
      const entry = await prisma.waitlist.update({
        where: { id },
        data: { enabled: true }
      })

      await writeAuditLog({
        actorId,
        action: "waitlist.enable",
        payload: { id, email: entry.email },
        ipAddress
      })

      return { success: true }
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          section: "internal-admin-mutations",
          op: "activateWaitlistEntry"
        },
        extra: { id }
      })
      return { failure: { reason: "No se pudo activar la entrada" } }
    }
  })

export const deactivateWaitlistEntry = internalAdminActionClient
  .inputSchema(z.object({ id: z.string().min(1) }))
  .action(async ({ parsedInput: { id }, ctx: { actorId, ipAddress } }) => {
    try {
      const entry = await prisma.waitlist.update({
        where: { id },
        data: { enabled: false }
      })

      await writeAuditLog({
        actorId,
        action: "waitlist.disable",
        payload: { id, email: entry.email },
        ipAddress
      })

      return { success: true }
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          section: "internal-admin-mutations",
          op: "deactivateWaitlistEntry"
        },
        extra: { id }
      })
      return { failure: { reason: "No se pudo desactivar la entrada" } }
    }
  })

export const createEnabledWaitlistEntry = internalAdminActionClient
  .inputSchema(
    z.object({
      email: z.email().transform(email => email.trim().toLowerCase())
    })
  )
  .action(async ({ parsedInput: { email }, ctx: { actorId, ipAddress } }) => {
    try {
      await prisma.waitlist.upsert({
        where: { email },
        update: { enabled: true },
        create: { email, enabled: true }
      })

      await writeAuditLog({
        actorId,
        action: "waitlist.create-enabled",
        payload: { email },
        ipAddress
      })

      return { success: true }
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          section: "internal-admin-mutations",
          op: "createEnabledWaitlistEntry"
        },
        extra: { email }
      })
      return {
        failure: {
          reason: "No se pudo crear la entrada en la lista de espera"
        }
      }
    }
  })
