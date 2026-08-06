import { describe, expect, it } from "vitest"

import {
  allocatePaymentFIFO,
  calculateBalanceMinor,
  currencyToMinorUnits,
  decimalToMinorUnits,
  getPaymentStatus
} from "../payments"

describe("decimalToMinorUnits", () => {
  it("converts valid decimal currency inputs", () => {
    expect(decimalToMinorUnits("12.34")).toBe(1234)
    expect(decimalToMinorUnits(5)).toBe(500)
    expect(decimalToMinorUnits("0.01")).toBe(1)
    expect(decimalToMinorUnits(0.07)).toBe(7)
    expect(decimalToMinorUnits(0.29)).toBe(29)
  })

  it("rejects nonpositive and more-than-two-decimal inputs", () => {
    expect(() => decimalToMinorUnits(0)).toThrow(/positive/)
    expect(() => decimalToMinorUnits("-1")).toThrow(/nonnegative/)
    expect(() => decimalToMinorUnits("1.001")).toThrow(/two decimal/)
    expect(() => decimalToMinorUnits("not money")).toThrow(/currency amount/i)
  })

  it("allows zero only for non-payment totals", () => {
    expect(currencyToMinorUnits(0)).toBe(0)
    expect(() => decimalToMinorUnits(0)).toThrow(/positive/)
    expect(getPaymentStatus(0, 0)).toBe("PAID")
  })
})

describe("payment calculations", () => {
  it("derives payment status and clamps balance at zero", () => {
    expect(getPaymentStatus(1000, 0)).toBe("PENDING")
    expect(getPaymentStatus(1000, 400)).toBe("PARTIAL")
    expect(getPaymentStatus(1000, 1000)).toBe("PAID")
    expect(getPaymentStatus(1000, 1200)).toBe("PAID")
    expect(calculateBalanceMinor(1000, 400)).toBe(600)
    expect(calculateBalanceMinor(1000, 1200)).toBe(0)
  })
})

describe("allocatePaymentFIFO", () => {
  const sales = [
    { id: "sale-2", balanceMinor: 700, createdAt: "2026-01-02" },
    { id: "paid", balanceMinor: 0, createdAt: "2026-01-01" },
    { id: "sale-1", balanceMinor: 500, createdAt: "2026-01-01" }
  ]

  it("allocates a payment fully in oldest-first order", () => {
    expect(allocatePaymentFIFO(sales, 1200)).toEqual([
      { saleId: "sale-1", amountMinor: 500 },
      { saleId: "sale-2", amountMinor: 700 }
    ])
  })

  it("allocates a partial payment and excludes zero balances", () => {
    expect(allocatePaymentFIFO(sales, 600)).toEqual([
      { saleId: "sale-1", amountMinor: 500 },
      { saleId: "sale-2", amountMinor: 100 }
    ])
  })

  it("rejects payments greater than the open balance", () => {
    expect(() => allocatePaymentFIFO(sales, 1201)).toThrow(/exceed/)
  })
})
