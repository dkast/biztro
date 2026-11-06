import { loadEnvFile } from "node:process"
import { Redis } from "@upstash/redis"
import { expect, it, vi } from "vitest"
import { z } from "zod/v4"

import { orderRealtimeSchema } from "@/lib/types/order-realtime"

vi.mock("server-only", () => ({}))
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }))
vi.mock("next/navigation", () => ({ unstable_rethrow: vi.fn() }))
const authContext = vi.hoisted(() => ({ organizationId: "" }))
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: async () => ({ user: { id: "__validation_user" } }),
      getActiveMember: async () => ({
        organizationId: authContext.organizationId
      })
    }
  }
}))

it.runIf(process.env.RUN_UPSTASH_INTEGRATION === "1")(
  "delivers and replays committed invalidations through a real Redis SSE stream",
  async () => {
    loadEnvFile(".env")
    const { env } = await import("@/env.mjs")
    const { publishOrderChange } = await import("@/server/orders/realtime")
    const { GET } = await import("@/app/api/realtime/route")
    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN
    })
    const organizationId = `__validation_${crypto.randomUUID()}`
    authContext.organizationId = organizationId
    const channel = `orders:${organizationId}`
    const controller = new AbortController()
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
    const timeout = setTimeout(() => {
      void reader?.cancel()
      controller.abort()
    }, 15_000)
    const eventSchema = z.object({
      type: z.string().optional(),
      event: z.string().optional(),
      channel: z.string().optional(),
      id: z.string().optional(),
      data: z.unknown().optional()
    })

    async function readEvent(eventName: string) {
      while (reader) {
        const result = await reader.read()
        if (result.done) throw new Error("Realtime stream closed early")
        const event = eventSchema.parse(
          JSON.parse(
            new TextDecoder().decode(result.value).slice("data: ".length)
          )
        )
        if (event.event === eventName || event.type === eventName) return event
      }
      throw new Error("Realtime reader is missing")
    }

    try {
      expect(await redis.ping()).toBe("PONG")
      const url = new URL("http://localhost/api/realtime")
      url.searchParams.set("channel", channel)
      const firstResponse = await GET(
        new Request(url, { signal: controller.signal })
      )
      expect(firstResponse?.status).toBe(200)
      reader = firstResponse?.body?.getReader()
      await readEvent("orders.connected")
      await publishOrderChange(organizationId, "created")
      const first = await readEvent("orders.changed")
      expect(first.channel).toBe(channel)
      expect(first.data).toEqual({
        changeId: expect.any(String),
        reason: "created"
      })
      await reader?.cancel()
      reader = undefined

      // Deliver while disconnected; reconnect must replay after the last ack.
      await publishOrderChange(organizationId, "settled")
      if (!first.id) throw new Error("Missing realtime event cursor")
      url.searchParams.set(`last_ack_${channel}`, first.id)
      const secondResponse = await GET(
        new Request(url, { signal: controller.signal })
      )
      reader = secondResponse?.body?.getReader()
      const second = await readEvent("orders.changed")
      expect(orderRealtimeSchema.orders.changed.parse(second.data).reason).toBe(
        "settled"
      )
      expect(second.id).not.toBe(first.id)
      expect(await redis.ttl(channel)).toBeGreaterThan(0)
    } finally {
      clearTimeout(timeout)
      controller.abort()
      await reader?.cancel()
      await redis.del(channel)
    }
  },
  20_000
)
