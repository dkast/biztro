import type * as RealtimeSdk from "@upstash/realtime"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { GET } from "@/app/api/realtime/route"

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  getActiveMember: vi.fn(),
  stream: vi.fn<(request: Request) => Promise<Response>>(),
  captureException: vi.fn()
}))

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: mocks.getSession,
      getActiveMember: mocks.getActiveMember
    }
  }
}))
vi.mock("@/server/orders/realtime", () => ({ realtime: {} }))
vi.mock("@sentry/nextjs", () => ({ captureException: mocks.captureException }))
vi.mock("next/navigation", () => ({ unstable_rethrow: vi.fn() }))
vi.mock("@upstash/realtime", async importOriginal => ({
  ...(await importOriginal<typeof RealtimeSdk>()),
  handle:
    ({
      middleware
    }: {
      middleware: (args: {
        request: Request
        channels: string[]
      }) => Promise<Response | void>
    }) =>
    async (request: Request) => {
      const requested = new URL(request.url).searchParams.getAll("channel")
      const channels = [...new Set(requested.length ? requested : ["default"])]
      return (await middleware({ request, channels })) ?? mocks.stream(request)
    }
}))

function request(channels: string[] = []) {
  const url = new URL("http://localhost/api/realtime")
  channels.forEach(channel => url.searchParams.append("channel", channel))
  return new Request(url)
}

function eventResponse(event: unknown) {
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`)
        )
        controller.close()
      }
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control"
      }
    }
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.getSession.mockResolvedValue({ user: { id: "user_a" } })
  mocks.getActiveMember.mockResolvedValue({
    userId: "user_a",
    organizationId: "org_a"
  })
  mocks.stream.mockImplementation(async () =>
    eventResponse({ type: "connected", channel: "orders:org_a" })
  )
})

describe("organization order stream", () => {
  it("rejects anonymous users before opening Redis", async () => {
    mocks.getSession.mockResolvedValue(null)
    const response = await GET(request(["orders:org_a"]))
    expect(response.status).toBe(401)
    expect(mocks.getActiveMember).not.toHaveBeenCalled()
    expect(mocks.stream).not.toHaveBeenCalled()
  })

  it("rejects a missing active membership", async () => {
    mocks.getActiveMember.mockResolvedValue(null)
    const response = await GET(request(["orders:org_a"]))
    expect(response.status).toBe(403)
    expect(mocks.stream).not.toHaveBeenCalled()
  })

  it.each([
    [],
    ["default"],
    [""],
    ["orders:org_b"],
    ["orders:org_a", "orders:org_b"],
    ["orders:org_a", "default"]
  ])("rejects unauthorized channel selection %j", async (...channels) => {
    const response = await GET(request(channels))
    expect(response.status).toBe(403)
    expect(mocks.stream).not.toHaveBeenCalled()
  })

  it("opens only the active organization channel and keeps the stream private", async () => {
    const response = await GET(request(["orders:org_a"]))
    expect(response.status).toBe(200)
    expect(mocks.stream).toHaveBeenCalledTimes(1)
    expect(response.headers.get("Content-Type")).toBe("text/event-stream")
    expect(response.headers.get("Cache-Control")).toBe("private, no-store")
    expect(response.headers.has("Access-Control-Allow-Origin")).toBe(false)
    expect(response.headers.has("Access-Control-Allow-Headers")).toBe(false)
    expect(await response.text()).toContain('"type":"connected"')
  })

  it("requests recovery even when native reconnect does not change SDK status", async () => {
    const url = new URL(request(["orders:org_a"]).url)
    url.searchParams.set("last_ack_orders:org_a", "123-4")
    const response = await GET(new Request(url))
    const frames = (await response.text())
      .trim()
      .split("\n\n")
      .map(frame => JSON.parse(frame.slice("data: ".length)))
    expect(frames).toEqual([
      { type: "connected", channel: "orders:org_a" },
      {
        event: "orders.connected",
        id: "123-4",
        channel: "orders:org_a",
        data: {}
      }
    ])
  })

  it("normalizes the SDK initial timestamp ack to a valid cursor", async () => {
    const url = new URL(request(["orders:org_a"]).url)
    url.searchParams.set("last_ack_orders:org_a", "123")
    const response = await GET(new Request(url))
    expect(await response.text()).toContain('"id":"123-0"')
  })

  it("passes invalidation events without including order details", async () => {
    const event = {
      event: "orders.changed",
      channel: "orders:org_a",
      id: "123-0",
      data: {
        changeId: "637f54f6-876f-4469-9190-46d356bd7cf2",
        reason: "created"
      }
    }
    mocks.stream.mockImplementation(async () => eventResponse(event))
    const response = await GET(request(["orders:org_a"]))
    expect(await response.text()).toBe(`data: ${JSON.stringify(event)}\n\n`)
  })

  it("disconnects and reports in-band Redis errors instead of staying falsely live", async () => {
    mocks.stream.mockImplementation(async () =>
      eventResponse({ type: "error", error: "Redis connection failed" })
    )
    const response = await GET(request(["orders:org_a"]))
    await expect(response.text()).rejects.toThrow(
      "Realtime Redis subscription failed"
    )
    expect(mocks.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { section: "orders-realtime", operation: "stream" }
      })
    )
  })

  it("cancels the upstream subscription when the browser closes its reader", async () => {
    const cancel = vi.fn()
    mocks.stream.mockImplementation(
      async () =>
        new Response(new ReadableStream({ cancel }), {
          headers: { "Content-Type": "text/event-stream" }
        })
    )
    const response = await GET(request(["orders:org_a"]))
    await response.body?.cancel()
    await vi.waitFor(() => expect(cancel).toHaveBeenCalledTimes(1))
  })

  it("reports connection failures without returning an empty successful stream", async () => {
    const error = new Error("Session lookup failed")
    mocks.getSession.mockRejectedValue(error)
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    try {
      const response = await GET(request(["orders:org_a"]))
      expect(response.status).toBe(500)
      expect(mocks.stream).not.toHaveBeenCalled()
      expect(mocks.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          tags: { section: "orders-realtime", operation: "connect" }
        })
      )
    } finally {
      consoleError.mockRestore()
    }
  })
})
