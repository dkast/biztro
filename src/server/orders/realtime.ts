import "server-only"

import * as Sentry from "@sentry/nextjs"
import { Realtime } from "@upstash/realtime"
import { Redis } from "@upstash/redis"

import {
  getOrdersChannel,
  orderRealtimeSchema,
  type OrderChangeReason
} from "@/lib/types/order-realtime"
import { env } from "@/env.mjs"

const redisConfig = {
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN
}

const realtimeConfig = {
  schema: orderRealtimeSchema,
  maxDurationSecs: 300,
  history: { maxLength: 256, expireAfterSecs: 3_600 }
}

export const realtime = new Realtime({
  ...realtimeConfig,
  redis: new Redis(redisConfig)
})

// Publishing has a short timeout; the subscription must stay open much longer.
const publisher = new Realtime({
  ...realtimeConfig,
  redis: new Redis({
    ...redisConfig,
    retry: false,
    signal: () => AbortSignal.timeout(2_000)
  })
})

export async function publishOrderChange(
  organizationId: string,
  reason: OrderChangeReason
) {
  const data = { changeId: crypto.randomUUID(), reason }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await publisher
        .channel(getOrdersChannel(organizationId))
        .emit("orders.changed", data)
      return
    } catch (error) {
      if (attempt === 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
        continue
      }

      // The database commit already succeeded. Never invite a duplicate payment.
      console.error("Failed to publish order change", error)
      Sentry.captureException(error, {
        tags: { section: "orders-realtime", operation: "publish", reason },
        extra: { organizationId, changeId: data.changeId }
      })
    }
  }
}
