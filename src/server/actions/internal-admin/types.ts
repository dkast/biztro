import type { AppRole } from "@/lib/auth-admin-access"

// Action-context type injected by the internal admin action clients.
export type AdminCtx = {
  actorId: string
  actorRole: AppRole
  ipAddress: string | undefined
}
