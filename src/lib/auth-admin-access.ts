import { createAccessControl } from "better-auth/plugins/access"
import { defaultStatements } from "better-auth/plugins/admin/access"

// ---------------------------------------------------------------------------
// Role constants
// ---------------------------------------------------------------------------

export const ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPERUSER: "superuser"
} as const

export type AppRole = (typeof ROLES)[keyof typeof ROLES]

// ---------------------------------------------------------------------------
// Access control statements
// Extends the built-in user/session admin statements with app-level resources.
// ---------------------------------------------------------------------------

export const ac = createAccessControl({
  ...defaultStatements,
  organization: ["read", "update", "delete", "list"] as const,
  menu: ["create", "update", "delete", "publish", "list"] as const,
  auditLog: ["read", "list"] as const
})

// ---------------------------------------------------------------------------
// Role permissions
// ---------------------------------------------------------------------------

/** Ordinary signed-in user – no admin user/session capabilities */
export const userRole = ac.newRole({
  organization: ["read"],
  menu: ["create", "update", "publish"]
})

/** Internal admin – full user/session management + org/menu access */
export const adminRole = ac.newRole({
  user: ["list", "ban", "impersonate", "get"],
  session: ["list", "revoke"],
  organization: ["read", "update", "list"],
  menu: ["create", "update", "delete", "publish", "list"],
  auditLog: ["read", "list"]
})

/** Super-user – all admin capabilities including destructive operations */
export const superuserRole = ac.newRole({
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "impersonate-admins",
    "delete",
    "set-password",
    "set-email",
    "get",
    "update"
  ],
  session: ["list", "revoke", "delete"],
  organization: ["read", "update", "delete", "list"],
  menu: ["create", "update", "delete", "publish", "list"],
  auditLog: ["read", "list"]
})

export const roles = {
  user: userRole,
  admin: adminRole,
  superuser: superuserRole
}

// ---------------------------------------------------------------------------
// Role-parsing helpers
// ---------------------------------------------------------------------------

/**
 * Parse a single unknown value into a validated AppRole, falling back to
 * "user" for anything that does not match a known role string.
 */
export function parseRole(value: unknown): AppRole {
  if (value === ROLES.ADMIN || value === ROLES.SUPERUSER) return value
  return ROLES.USER
}

/**
 * Parse a comma-separated string (or array) of raw role tokens into a
 * deduplicated, validated `AppRole[]`.  Unrecognised tokens are silently
 * coerced to `"user"`.
 *
 * @example
 *   parseRoles("admin,superuser")   // => ["admin", "superuser"]
 *   parseRoles(["admin", "unknown"]) // => ["admin", "user"]
 *   parseRoles(null)                // => ["user"]
 */
export function parseRoles(value: unknown): AppRole[] {
  const tokens: unknown[] = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",").map(t => t.trim())
      : [value]

  const seen = new Set<AppRole>()
  for (const token of tokens) {
    seen.add(parseRole(token))
  }
  return Array.from(seen)
}

/**
 * Returns `true` when a single role value has admin-level access.
 * Accepts the same shapes as `parseRole`.
 */
export function isAdminRole(role: unknown): boolean {
  return role === ROLES.ADMIN || role === ROLES.SUPERUSER
}

/**
 * Returns `true` when *any* role in a comma-separated string or array has
 * admin-level access.
 *
 * @example
 *   hasAdminRole("user,admin")   // => true
 *   hasAdminRole(["user"])       // => false
 */
export function hasAdminRole(value: unknown): boolean {
  return parseRoles(value).some(isAdminRole)
}
