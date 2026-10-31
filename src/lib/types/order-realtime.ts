import { z } from "zod/v4"

export type LiveConnectionState =
  "live" | "syncing" | "connecting" | "stale" | "offline"

export const orderChangeReasonSchema = z.enum([
  "created",
  "preparation",
  "restored",
  "cancellation",
  "acknowledged",
  "settled",
  "settings"
])

export type OrderChangeReason = z.infer<typeof orderChangeReasonSchema>

export const orderRealtimeSchema = {
  orders: {
    connected: z.object({}),
    changed: z.object({
      changeId: z.uuid(),
      reason: orderChangeReasonSchema
    })
  }
}

export function getOrdersChannel(organizationId: string) {
  return `orders:${organizationId}`
}
