import { describe, expect, it } from "vitest"

import { getCollectionBreakdown, getFinancialMetrics } from "../sales-reporting"

describe("sales financial metrics", () => {
  it("keeps credit sales separate from later collections", () => {
    const metrics = getFinancialMetrics({
      sales: [
        {
          createdAt: new Date("2026-08-10T10:00:00Z"),
          total: 10,
          paymentAllocations: [
            {
              amountMinor: 300,
              payment: { status: "ACTIVE", origin: "SALE" }
            },
            {
              amountMinor: 700,
              payment: { status: "ACTIVE", origin: "RECEIVABLE" }
            }
          ]
        }
      ],
      payments: [
        {
          createdAt: new Date("2026-08-12T10:00:00Z"),
          amountMinor: 700,
          method: "TRANSFER",
          origin: "RECEIVABLE",
          status: "ACTIVE"
        }
      ]
    })

    expect(metrics).toEqual({
      sales: 10,
      collected: 7,
      paidAtSale: 3,
      creditGenerated: 7,
      receivableCollection: 7
    })
  })

  it("excludes void allocations from the paid-at-sale split", () => {
    const metrics = getFinancialMetrics({
      sales: [
        {
          createdAt: new Date("2026-08-10T10:00:00Z"),
          total: 10,
          paymentAllocations: [
            {
              amountMinor: 500,
              payment: { status: "ACTIVE", origin: "SALE" }
            },
            {
              amountMinor: 500,
              payment: { status: "VOID", origin: "SALE" }
            }
          ]
        }
      ],
      payments: []
    })

    expect(metrics.paidAtSale).toBe(5)
    expect(metrics.creditGenerated).toBe(5)
  })
})

describe("collection breakdown", () => {
  it("reconciles method and origin subtotals", () => {
    const breakdown = getCollectionBreakdown([
      {
        createdAt: new Date("2026-08-10T10:00:00Z"),
        amountMinor: 300,
        method: "CASH",
        origin: "SALE",
        status: "ACTIVE"
      },
      {
        createdAt: new Date("2026-08-10T11:00:00Z"),
        amountMinor: 700,
        method: "CASH",
        origin: "RECEIVABLE",
        status: "ACTIVE"
      },
      {
        createdAt: new Date("2026-08-10T12:00:00Z"),
        amountMinor: 500,
        method: "TRANSFER",
        origin: "RECEIVABLE",
        status: "ACTIVE"
      },
      {
        createdAt: new Date("2026-08-10T13:00:00Z"),
        amountMinor: 900,
        method: "CARD",
        origin: "SALE",
        status: "VOID"
      }
    ])

    expect(breakdown).toEqual([
      {
        method: "CASH",
        origin: "RECEIVABLE",
        amount: 7,
        amountMinor: 700,
        payments: 1
      },
      {
        method: "TRANSFER",
        origin: "RECEIVABLE",
        amount: 5,
        amountMinor: 500,
        payments: 1
      },
      {
        method: "CASH",
        origin: "SALE",
        amount: 3,
        amountMinor: 300,
        payments: 1
      }
    ])
  })
})
