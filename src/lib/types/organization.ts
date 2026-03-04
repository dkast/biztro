import { z } from "zod/v4"

import { SubscriptionStatus } from "@/lib/types/billing"

export const orgSchema = z.object({
  id: z.string().optional(),
  name: z
    .string({
      error: issue =>
        issue.input === undefined ? "Nombre es requerido" : undefined
    })
    .min(3, {
      error: "Nombre muy corto"
    })
    .max(100, {
      error: "Nombre muy largo"
    }),
  description: z.string().optional(),
  logo: z.url().optional(),
  banner: z.url().optional(),
  status: z.enum(SubscriptionStatus),
  plan: z.enum(["BASIC", "PRO"]),
  subdomain: z
    .string()
    .min(3, {
      error: "Subdominio muy corto"
    })
    .trim()
    .regex(/^[a-z0-9-]+$/i, {
      error: "Solo letras, números y guiones son permitidos"
    })
    .optional(),
  slug: z
    .string()
    .min(3, {
      error: "Subdominio muy corto"
    })
    .trim()
    .regex(/^[a-z0-9-]+$/i, {
      error: "Solo letras, números y guiones son permitidos"
    })
})

export const enum MembershipRole {
  ADMIN = "admin",
  MEMBER = "member",
  OWNER = "owner"
}
