import { describe, expect, it, vi } from "vitest"

import { actionClient } from "@/lib/safe-actions"

const mocks = vi.hoisted(() => ({
  captureException: vi.fn(),
  error: vi.fn(),
  flush: vi.fn()
}))

vi.mock("@sentry/nextjs", () => ({
  captureException: mocks.captureException
}))
vi.mock("next-axiom", () => ({
  Logger: class {
    error = mocks.error
    flush = mocks.flush
  }
}))
vi.mock("next/navigation", () => ({ redirect: vi.fn() }))
vi.mock("@/lib/session", () => ({ getCurrentUser: vi.fn() }))
vi.mock("@/server/actions/user/queries", () => ({
  getCurrentMembership: vi.fn()
}))

describe("safe action server errors", () => {
  it("returns an explicit error instead of an empty success-shaped result", async () => {
    const error = new Error("Private database failure")
    const action = actionClient.action(async () => {
      throw error
    })

    const result = await action()

    expect(result).toEqual({
      serverError: "No se pudo completar la operación. Inténtalo de nuevo."
    })
    expect(JSON.stringify(result)).not.toContain(error.message)
    expect(mocks.captureException).toHaveBeenCalledWith(error)
    expect(mocks.error).toHaveBeenCalledWith("Error in safe action", error)
    expect(mocks.flush).toHaveBeenCalledOnce()
  })
})
