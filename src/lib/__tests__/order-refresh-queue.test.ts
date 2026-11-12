import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  createOrderRefreshQueue,
  getOrderLiveState
} from "@/lib/order-refresh-queue"

describe("order refresh queue", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("never polls an idle screen", () => {
    const refresh = vi.fn()
    createOrderRefreshQueue(refresh, vi.fn())
    vi.advanceTimersByTime(60 * 60_000)
    expect(refresh).not.toHaveBeenCalled()
  })

  it("coalesces a burst, including overlapping focus and connection triggers", () => {
    const refresh = vi.fn()
    const pending = vi.fn()
    const queue = createOrderRefreshQueue(refresh, pending)
    for (let index = 0; index < 25; index++) queue.request()
    vi.advanceTimersByTime(149)
    expect(refresh).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(queue.complete()).toBe(false)
    expect(pending).toHaveBeenLastCalledWith(false)
    vi.advanceTimersByTime(60_000)
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it("retains events received in flight and never overlaps refreshes", () => {
    const refresh = vi.fn()
    const queue = createOrderRefreshQueue(refresh, vi.fn())
    queue.request()
    vi.advanceTimersByTime(150)
    queue.request()
    queue.request()
    vi.advanceTimersByTime(60_000)
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(queue.complete()).toBe(true)
    vi.advanceTimersByTime(150)
    expect(refresh).toHaveBeenCalledTimes(2)
    expect(queue.complete()).toBe(false)
  })

  it("pauses queued work when hidden and fetches after recovery", () => {
    const refresh = vi.fn()
    const queue = createOrderRefreshQueue(refresh, vi.fn())
    queue.request()
    queue.pause()
    vi.advanceTimersByTime(60_000)
    expect(refresh).not.toHaveBeenCalled()
    queue.request()
    vi.advanceTimersByTime(150)
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it("does not overlap an in-flight refresh across disconnect/reconnect", () => {
    const refresh = vi.fn()
    const queue = createOrderRefreshQueue(refresh, vi.fn())
    queue.request()
    vi.advanceTimersByTime(150)
    queue.pause()
    queue.request()
    vi.advanceTimersByTime(150)
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(queue.complete()).toBe(true)
    vi.advanceTimersByTime(150)
    expect(refresh).toHaveBeenCalledTimes(2)
  })
})

describe("order connection state", () => {
  const live = {
    isOnline: true,
    enabled: true,
    status: "connected",
    isReconciled: true,
    isPending: false,
    hasError: false
  } as const

  it("keeps an idle, connected snapshot live without an age-based expiry", () => {
    expect(getOrderLiveState(live)).toEqual({ state: "live", canWrite: true })
  })

  it("requires a snapshot after initial subscription or reconnect", () => {
    expect(getOrderLiveState({ ...live, isReconciled: false })).toEqual({
      state: "syncing",
      canWrite: false
    })
  })

  it("allows normal optimistic writes while a healthy snapshot refreshes", () => {
    expect(getOrderLiveState({ ...live, isPending: true })).toEqual({
      state: "syncing",
      canWrite: true
    })
  })

  it.each(["connecting", "disconnected"] as const)(
    "disables writes when %s",
    status => {
      expect(getOrderLiveState({ ...live, status })).toEqual({
        state: "connecting",
        canWrite: false
      })
    }
  )

  it("disables writes on failed refreshes or exhausted connections", () => {
    expect(getOrderLiveState({ ...live, hasError: true })).toEqual({
      state: "stale",
      canWrite: false
    })
    expect(getOrderLiveState({ ...live, status: "error" })).toEqual({
      state: "stale",
      canWrite: false
    })
  })

  it("disables writes while offline or the subscription is paused", () => {
    expect(getOrderLiveState({ ...live, isOnline: false })).toEqual({
      state: "offline",
      canWrite: false
    })
    expect(getOrderLiveState({ ...live, enabled: false })).toEqual({
      state: "connecting",
      canWrite: false
    })
  })
})
