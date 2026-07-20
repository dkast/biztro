import { z } from "zod/v4"

export const setOrgEntitlementSchema = z.object({
  orgId: z.string().min(1)
})

export const banUserSchema = z.object({
  userId: z.string().min(1),
  banReason: z.string().max(500).optional(),
  /** Duration in seconds; omit for a permanent ban. */
  banExpiresIn: z.number().int().positive().optional()
})

export const unbanUserSchema = z.object({
  userId: z.string().min(1)
})

export const setUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["user", "admin", "superuser"])
})

export const waitlistEntrySchema = z.object({
  email: z.email()
})

export const impersonateUserSchema = z.object({
  userId: z.string().min(1)
})
