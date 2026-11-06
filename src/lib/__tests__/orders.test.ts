import { describe, expect, it } from "vitest"

import {
  checkSalePayments,
  formatElapsed,
  formatOrderNumber,
  getElapsedMinutes,
  getElapsedTone,
  getKitchenBoardColumns,
  getKitchenPageSize,
  getNextKitchenStatus,
  mergeCartItems,
  normalizeOptionalText,
  paginate
} from "@/lib/orders"

describe("getNextKitchenStatus", () => {
  it("advances through the kitchen flow", () => {
    expect(getNextKitchenStatus("NEW")).toBe("PREPARING")
    expect(getNextKitchenStatus("PREPARING")).toBe("READY")
    expect(getNextKitchenStatus("READY")).toBeNull()
  })
})

describe("getKitchenBoardColumns", () => {
  it("picks columns at breakpoint boundaries", () => {
    expect(getKitchenBoardColumns(1360)).toBe(5)
    expect(getKitchenBoardColumns(1359)).toBe(3)
    expect(getKitchenBoardColumns(820)).toBe(3)
    expect(getKitchenBoardColumns(819)).toBe(2)
    expect(getKitchenBoardColumns(520)).toBe(2)
    expect(getKitchenBoardColumns(519)).toBe(1)
  })
})

describe("getKitchenPageSize", () => {
  it("maps columns to page size", () => {
    expect(getKitchenPageSize(5)).toBe(10)
    expect(getKitchenPageSize(3)).toBe(6)
    expect(getKitchenPageSize(2)).toBe(4)
    expect(getKitchenPageSize(1)).toBe(4)
  })
})

describe("paginate", () => {
  const items = Array.from({ length: 15 }, (_, index) => index + 1)

  it("returns the first page", () => {
    const result = paginate(items, 1, 10)
    expect(result.items).toHaveLength(10)
    expect(result.page).toBe(1)
    expect(result.pageCount).toBe(2)
    expect(result.remaining).toBe(5)
  })

  it("returns the last page", () => {
    const result = paginate(items, 2, 10)
    expect(result.items).toEqual([11, 12, 13, 14, 15])
    expect(result.remaining).toBe(0)
  })

  it("clamps out-of-range pages", () => {
    expect(paginate(items, 0, 10).page).toBe(1)
    expect(paginate(items, -3, 10).page).toBe(1)
    expect(paginate(items, 99, 10).page).toBe(2)
    expect(paginate(items, Number.NaN, 10).page).toBe(1)
  })

  it("handles an empty list", () => {
    const result = paginate([], 1, 10)
    expect(result.items).toEqual([])
    expect(result.pageCount).toBe(1)
    expect(result.remaining).toBe(0)
  })
})

describe("getElapsedMinutes", () => {
  const start = new Date("2026-01-01T10:00:00.000Z")
  const startMs = start.getTime()

  it("floors minutes from an ISO string", () => {
    expect(
      getElapsedMinutes(start.toISOString(), startMs + 5 * 60_000 + 59_000)
    ).toBe(5)
  })

  it("floors minutes from a Date", () => {
    expect(getElapsedMinutes(start, startMs + 90_000)).toBe(1)
  })

  it("never returns negative values", () => {
    expect(getElapsedMinutes(start, startMs - 10 * 60_000)).toBe(0)
  })

  it("returns 0 for invalid dates", () => {
    expect(getElapsedMinutes("not-a-date", startMs)).toBe(0)
  })
})

describe("getElapsedTone", () => {
  it("classifies elapsed minutes", () => {
    expect(getElapsedTone(0)).toBe("normal")
    expect(getElapsedTone(9)).toBe("normal")
    expect(getElapsedTone(10)).toBe("warning")
    expect(getElapsedTone(19)).toBe("warning")
    expect(getElapsedTone(20)).toBe("critical")
    expect(getElapsedTone(120)).toBe("critical")
  })
})

describe("formatElapsed", () => {
  it("formats minutes and hours", () => {
    expect(formatElapsed(0)).toBe("Ahora")
    expect(formatElapsed(5)).toBe("5 min")
    expect(formatElapsed(60)).toBe("1 h")
    expect(formatElapsed(75)).toBe("1 h 15 min")
  })
})

describe("formatOrderNumber", () => {
  it("prefixes with #", () => {
    expect(formatOrderNumber(12)).toBe("#12")
  })
})

describe("normalizeOptionalText", () => {
  it("trims and nullifies empty values", () => {
    expect(normalizeOptionalText("  hola  ")).toBe("hola")
    expect(normalizeOptionalText(undefined)).toBeNull()
    expect(normalizeOptionalText(null)).toBeNull()
    expect(normalizeOptionalText("   ")).toBeNull()
  })
})

describe("mergeCartItems", () => {
  it("merges identical items and sums quantities", () => {
    expect(
      mergeCartItems([
        { menuItemId: "a", variantId: "v1", quantity: 1 },
        { menuItemId: "a", variantId: "v1", quantity: 2 }
      ])
    ).toEqual([{ menuItemId: "a", variantId: "v1", quantity: 3 }])
  })

  it("keeps different variants separate", () => {
    expect(
      mergeCartItems([
        { menuItemId: "a", variantId: "v1", quantity: 1 },
        { menuItemId: "a", variantId: "v2", quantity: 1 },
        { menuItemId: "a", quantity: 1 }
      ])
    ).toHaveLength(3)
  })

  it("does not mutate input objects", () => {
    const first = { menuItemId: "a", quantity: 1 }
    const second = { menuItemId: "a", quantity: 2 }
    const result = mergeCartItems([first, second])

    expect(result).toEqual([{ menuItemId: "a", quantity: 3 }])
    expect(first.quantity).toBe(1)
    expect(second.quantity).toBe(2)
  })
})

describe("checkSalePayments", () => {
  it("fails when payments exceed the total", () => {
    const result = checkSalePayments({
      total: 100,
      payments: [{ amount: 100.01 }],
      acceptsCredit: false
    })
    expect(result).toEqual({
      failure: "Los pagos no pueden superar el total de la venta"
    })
  })

  it("requires a customer for partial payments", () => {
    const result = checkSalePayments({
      total: 100,
      payments: [{ amount: 50 }],
      acceptsCredit: true
    })
    expect("failure" in result && result.failure).toContain(
      "Selecciona un cliente"
    )
  })

  it("requires confirming credit balance", () => {
    const result = checkSalePayments({
      total: 100,
      payments: [{ amount: 50 }],
      customerId: "c1",
      acceptsCredit: false
    })
    expect("failure" in result && result.failure).toContain("Confirma el saldo")
  })

  it("accepts full payment", () => {
    const result = checkSalePayments({
      total: 100,
      payments: [{ amount: 60 }, { amount: 40 }],
      acceptsCredit: false
    })
    expect(result).toEqual({
      totalMinor: 10000,
      paymentsMinor: 10000,
      balanceMinor: 0
    })
  })

  it("computes balance for accepted partial payment", () => {
    const result = checkSalePayments({
      total: 100.5,
      payments: [{ amount: 40.25 }],
      customerId: "c1",
      acceptsCredit: true
    })
    expect("failure" in result).toBe(false)
    if ("failure" in result) return
    expect(result.balanceMinor).toBe(6025)
    expect(result.totalMinor).toBe(10050)
    expect(result.paymentsMinor).toBe(4025)
  })
})
