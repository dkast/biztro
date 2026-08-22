import { describe, expect, it } from "vitest"

import { resolveBarDomain } from "../bar-chart-domain"

const data = [
  { cash: 60, card: 40 },
  { cash: 50, card: 70 }
]

describe("resolveBarDomain", () => {
  it("uses the largest individual value for grouped bars", () => {
    expect(resolveBarDomain(data, ["cash", "card"], false)).toEqual([0, 77])
  })

  it("uses the largest cumulative value for stacked bars", () => {
    expect(resolveBarDomain(data, ["cash", "card"], true)).toEqual([0, 132])
  })
})
