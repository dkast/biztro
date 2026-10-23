import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { publishOrderChange } from "@/server/orders/realtime"

const mocks = vi.hoisted(() => ({
  emit: vi.fn(),
  channel: vi.fn(),
  captureException: vi.fn()
}))

vi.mock("server-only", () => ({}))
vi.mock("@/env.mjs", () => ({
  env: {
    UPSTASH_REDIS_REST_URL: "https://redis.example.test",
    UPSTASH_REDIS_REST_TOKEN: "synthetic-test-token"
  }
}))
vi.mock("@upstash/redis", () => ({
  Redis: class {}
}))
vi.mock("@upstash/realtime", () => ({
  Realtime: class {
    channel = mocks.channel
  }
}))
vi.mock("@sentry/nextjs", () => ({ captureException: mocks.captureException }))

describe("order change publication", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mocks.channel.mockReturnValue({ emit: mocks.emit })
    mocks.emit.mockResolvedValue(undefined)
  })
  afterEach(() => vi.useRealTimers())

  it("publishes a minimal typed invalidation only to the organization channel", async () => {
    await publishOrderChange("org_a", "created")
    expect(mocks.channel).toHaveBeenCalledWith("orders:org_a")
    expect(mocks.emit).toHaveBeenCalledWith("orders.changed", {
      changeId: expect.any(String),
      reason: "created"
    })
    expect(mocks.captureException).not.toHaveBeenCalled()
  })

  it("retries once using the same logical event identity", async () => {
    mocks.emit.mockRejectedValueOnce(new Error("Temporary Redis failure"))
    const publication = publishOrderChange("org_a", "settled")
    await vi.advanceTimersByTimeAsync(100)
    await publication
    expect(mocks.emit).toHaveBeenCalledTimes(2)
    expect(mocks.emit.mock.calls[0]).toEqual(mocks.emit.mock.calls[1])
    expect(mocks.captureException).not.toHaveBeenCalled()
  })

  it("reports exhausted retries without failing an already committed operation", async () => {
    const error = new Error("Redis unavailable")
    mocks.emit.mockRejectedValue(error)
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    try {
      const publication = publishOrderChange("org_a", "cancellation")
      await vi.advanceTimersByTimeAsync(100)
      await expect(publication).resolves.toBeUndefined()
      expect(mocks.emit).toHaveBeenCalledTimes(2)
      expect(mocks.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          tags: {
            section: "orders-realtime",
            operation: "publish",
            reason: "cancellation"
          }
        })
      )
      await vi.advanceTimersByTimeAsync(60_000)
      expect(mocks.emit).toHaveBeenCalledTimes(2)
    } finally {
      consoleError.mockRestore()
    }
  })
})
