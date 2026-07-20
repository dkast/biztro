import * as Sentry from "@sentry/nextjs"
import { createSafeActionClient } from "next-safe-action"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import {
  hasAdminRole,
  parseRoles,
  ROLES,
  type AppRole
} from "@/lib/auth-admin-access"

// ---------------------------------------------------------------------------
// Core session helpers
// ---------------------------------------------------------------------------

type RawSession = Awaited<ReturnType<typeof auth.api.getSession>>

function sessionImpersonated(session: RawSession): boolean {
  return Boolean(
    (session?.session as Record<string, unknown> | undefined)?.impersonatedBy
  )
}

function sessionRole(session: RawSession): string | null | undefined {
  return (session?.user as Record<string, unknown> | undefined)?.role as
    string | null | undefined
}

function sessionIpAddress(session: RawSession): string | undefined {
  return (session?.session as Record<string, unknown> | undefined)
    ?.ipAddress as string | undefined
}

function highestInternalRole(role: unknown): AppRole {
  const roles = parseRoles(role)
  if (roles.includes(ROLES.SUPERUSER)) return ROLES.SUPERUSER
  if (roles.includes(ROLES.ADMIN)) return ROLES.ADMIN
  return ROLES.USER
}

// ---------------------------------------------------------------------------
// Exported session type
// ---------------------------------------------------------------------------

export type AdminGuardSession = NonNullable<RawSession>

// ---------------------------------------------------------------------------
// getInternalAdminSession
//
// Validates that the caller is an authenticated, non-impersonated internal
// admin (role: admin | superuser) and returns the full session object.
// ---------------------------------------------------------------------------

export async function getInternalAdminSession(): Promise<AdminGuardSession> {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect("/login")
  }

  if (sessionImpersonated(session)) {
    redirect("/dashboard")
  }

  const role = sessionRole(session)
  if (!hasAdminRole(role)) {
    redirect("/dashboard")
  }

  return session as AdminGuardSession
}

// ---------------------------------------------------------------------------
// requireInternalAdmin / requireInternalSuperuser
// ---------------------------------------------------------------------------

/**
 * Require the current session to belong to an internal admin (role: admin or
 * superuser). Rejects impersonated sessions. Redirects on failure.
 */
export async function requireInternalAdmin(): Promise<AdminGuardSession> {
  return getInternalAdminSession()
}

/**
 * Require the current session to belong to an internal superuser (role:
 * superuser). Rejects impersonated sessions and redirects on failure.
 */
export async function requireInternalSuperuser(): Promise<AdminGuardSession> {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect("/login")
  }

  if (sessionImpersonated(session)) {
    redirect("/dashboard")
  }

  const role = sessionRole(session)
  if (!parseRoles(role).includes(ROLES.SUPERUSER)) {
    redirect("/dashboard")
  }

  return session as AdminGuardSession
}

// ---------------------------------------------------------------------------
// Safe-action clients
// ---------------------------------------------------------------------------

/**
 * Action client for mutations accessible to any internal admin (admin or
 * superuser). Rejects impersonated sessions. Injects
 * { actorId, actorRole, ipAddress } into ctx.
 */
export const internalAdminActionClient = createSafeActionClient({
  handleServerError(e) {
    Sentry.captureException(e, { tags: { section: "internal-admin" } })
  }
}).use(async ({ next }) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect("/login")
  }

  if (sessionImpersonated(session)) {
    redirect("/dashboard")
  }

  const role = sessionRole(session)
  if (!hasAdminRole(role)) {
    redirect("/dashboard")
  }

  return next({
    ctx: {
      actorId: session.user.id,
      actorRole: highestInternalRole(role),
      ipAddress: sessionIpAddress(session)
    }
  })
})

/**
 * Action client restricted to superuser-only mutations.
 * Rejects impersonated sessions.
 */
export const internalSuperuserActionClient = createSafeActionClient({
  handleServerError(e) {
    Sentry.captureException(e, {
      tags: { section: "internal-admin-superuser" }
    })
  }
}).use(async ({ next }) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect("/login")
  }

  if (sessionImpersonated(session)) {
    redirect("/dashboard")
  }

  const role = sessionRole(session)
  if (!parseRoles(role).includes(ROLES.SUPERUSER)) {
    redirect("/dashboard")
  }

  return next({
    ctx: {
      actorId: session.user.id,
      actorRole: ROLES.SUPERUSER as AppRole,
      ipAddress: sessionIpAddress(session)
    }
  })
})
