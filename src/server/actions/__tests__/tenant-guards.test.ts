import { describe, expect, it } from "vitest"

import {
  hasCompleteTenantSelection,
  isSameOrganization
} from "@/server/actions/tenant-guards"

describe("tenant ownership guards", () => {
  it("allows matching organization IDs", () => {
    expect(isSameOrganization("org_a", "org_a")).toBe(true)
  })

  it("denies missing or mismatched organization IDs", () => {
    expect(isSameOrganization(undefined, "org_a")).toBe(false)
    expect(isSameOrganization("org_b", "org_a")).toBe(false)
  })

  it("requires every requested row to be scoped to the active organization", () => {
    expect(hasCompleteTenantSelection(["item_a"], ["item_a"])).toBe(true)
    expect(hasCompleteTenantSelection(["item_a", "item_b"], ["item_a"])).toBe(
      false
    )
  })
})
