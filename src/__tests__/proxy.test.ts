import { proxy } from "@/proxy"
import { NextRequest } from "next/server"
import { describe, expect, it } from "vitest"

function request(url: string, headers?: HeadersInit) {
  return new NextRequest(url, { headers })
}

describe("proxy", () => {
  it("rewrites a customer subdomain root to the internal menu route", () => {
    const response = proxy(request("https://my-menu.biztro.co/"))

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://my-menu.biztro.co/menu-internal/my-menu"
    )
  })

  it("rewrites a path-based menu URL for local and preview testing", () => {
    const response = proxy(request("https://preview.biztro.co/menu/my-menu"))

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://preview.biztro.co/menu-internal/my-menu"
    )
  })

  it("does not rewrite public files or apex probe requests", () => {
    expect(
      proxy(request("https://my-menu.biztro.co/robots.txt")).headers.get(
        "x-middleware-rewrite"
      )
    ).toBeNull()
    expect(
      proxy(request("https://biztro.co/sse")).headers.get(
        "x-middleware-rewrite"
      )
    ).toBeNull()
  })

  it("rejects direct access to the internal menu route", () => {
    const response = proxy(request("https://biztro.co/menu-internal/my-menu"))

    expect(response.status).toBe(404)
  })

  it("allows an internally rewritten menu request to continue", () => {
    const response = proxy(
      request("https://my-menu.biztro.co/menu-internal/my-menu", {
        "x-biztro-menu-rewrite": "1"
      })
    )

    expect(response.headers.get("x-middleware-rewrite")).toBeNull()
  })
})
