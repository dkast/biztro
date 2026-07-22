import { describe, expect, it } from "vitest"

import {
  hasAdminRole,
  isAdminRole,
  parseRole,
  parseRoles,
  ROLES
} from "@/lib/auth-admin-access"

describe("parseRole", () => {
  it("returns 'admin' for the admin string", () => {
    expect(parseRole("admin")).toBe(ROLES.ADMIN)
  })

  it("returns 'superuser' for the superuser string", () => {
    expect(parseRole("superuser")).toBe(ROLES.SUPERUSER)
  })

  it("falls back to 'user' for unknown values", () => {
    expect(parseRole("unknown")).toBe(ROLES.USER)
    expect(parseRole(null)).toBe(ROLES.USER)
    expect(parseRole(undefined)).toBe(ROLES.USER)
    expect(parseRole(42)).toBe(ROLES.USER)
  })
})

describe("parseRoles", () => {
  it("parses a comma-separated string", () => {
    expect(parseRoles("admin,superuser")).toEqual(["admin", "superuser"])
  })

  it("trims whitespace around tokens", () => {
    expect(parseRoles("admin, user")).toEqual(["admin", "user"])
  })

  it("deduplicates repeated roles", () => {
    expect(parseRoles("admin,admin")).toEqual(["admin"])
  })

  it("coerces unknown tokens to 'user'", () => {
    expect(parseRoles("admin,unknown")).toEqual(["admin", "user"])
  })

  it("handles an array input", () => {
    expect(parseRoles(["admin", "superuser"])).toEqual(["admin", "superuser"])
  })

  it("handles a single valid string (no comma)", () => {
    expect(parseRoles("superuser")).toEqual(["superuser"])
  })

  it("returns ['user'] for null/undefined", () => {
    expect(parseRoles(null)).toEqual(["user"])
    expect(parseRoles(undefined)).toEqual(["user"])
  })
})

describe("isAdminRole", () => {
  it("returns true for admin and superuser", () => {
    expect(isAdminRole("admin")).toBe(true)
    expect(isAdminRole("superuser")).toBe(true)
  })

  it("returns false for user and unknowns", () => {
    expect(isAdminRole("user")).toBe(false)
    expect(isAdminRole(null)).toBe(false)
  })
})

describe("hasAdminRole", () => {
  it("returns true when any token is admin-level", () => {
    expect(hasAdminRole("user,admin")).toBe(true)
    expect(hasAdminRole(["user", "superuser"])).toBe(true)
  })

  it("returns false when no token is admin-level", () => {
    expect(hasAdminRole("user")).toBe(false)
    expect(hasAdminRole(["user", "unknown"])).toBe(false)
  })

  it("returns false for null/undefined", () => {
    expect(hasAdminRole(null)).toBe(false)
    expect(hasAdminRole(undefined)).toBe(false)
  })
})
