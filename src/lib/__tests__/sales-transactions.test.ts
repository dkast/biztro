import { PrismaClient } from "@/generated/prisma-client/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { parseSalesTransactionsSearchParams } from "@/lib/sales-transactions"
import { buildSalesTransactionsSql } from "@/lib/sales-transactions-sql"

const testNow = new Date(2026, 9, 6, 12)

type SqlRow = {
  id: string | null
  item_count: number | bigint | null
  paid_minor: number | bigint | null
  payment_methods: string | null
  voided_payment_methods: string | null
  total_count: number | bigint
}

describe("sales transaction filters", () => {
  it("defaults to the last 30 local calendar days, including today", () => {
    const result = parseSalesTransactionsSearchParams(
      new URLSearchParams(),
      testNow
    )

    expect(result.valid).toBe(true)
    if (!result.valid) return

    expect(result.filters.startDate).toEqual(new Date(2026, 8, 7))
    expect(result.filters.endDate).toEqual(new Date(2026, 9, 7))
    expect(result.filters.page).toBe(1)
  })

  it("uses inclusive custom dates and rejects incomplete or reversed ranges", () => {
    const result = parseSalesTransactionsSearchParams(
      new URLSearchParams("range=custom&from=2026-10-02&to=2026-10-05"),
      testNow
    )

    expect(result.valid).toBe(true)
    if (result.valid) {
      expect(result.filters.startDate).toEqual(new Date(2026, 9, 2))
      expect(result.filters.endDate).toEqual(new Date(2026, 9, 6))
    }

    expect(
      parseSalesTransactionsSearchParams(
        new URLSearchParams("range=custom&from=2026-10-02"),
        testNow
      )
    ).toMatchObject({ valid: false })

    expect(
      parseSalesTransactionsSearchParams(
        new URLSearchParams("range=custom&from=2026-10-06&to=2026-10-02"),
        testNow
      )
    ).toMatchObject({ valid: false })
  })

  it("rejects invalid enums, duplicate values, and oversized search terms", () => {
    expect(
      parseSalesTransactionsSearchParams(
        new URLSearchParams("status=NOT_A_STATUS"),
        testNow
      )
    ).toMatchObject({ valid: false })

    expect(
      parseSalesTransactionsSearchParams(
        new URLSearchParams("status=COMPLETED&status=VOID"),
        testNow
      )
    ).toMatchObject({ valid: false })

    expect(
      parseSalesTransactionsSearchParams(
        new URLSearchParams(`q=${"x".repeat(101)}`),
        testNow
      )
    ).toMatchObject({ valid: false })
  })
})

describe("sales transactions SQL", () => {
  let prisma: PrismaClient

  beforeEach(async () => {
    prisma = new PrismaClient({
      adapter: new PrismaLibSql({ url: "file::memory:" })
    })

    await prisma.$executeRaw`
      CREATE TABLE "Sale" (
        "id" TEXT PRIMARY KEY,
        "organizationId" TEXT NOT NULL,
        "createdAt" TEXT NOT NULL,
        "customerId" TEXT,
        "orderType" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "total" REAL NOT NULL,
        "currency" TEXT NOT NULL
      )
    `
    await prisma.$executeRaw`
      CREATE TABLE "Customer" (
        "id" TEXT PRIMARY KEY,
        "organizationId" TEXT NOT NULL,
        "name" TEXT NOT NULL
      )
    `
    await prisma.$executeRaw`
      CREATE TABLE "Payment" (
        "id" TEXT PRIMARY KEY,
        "organizationId" TEXT NOT NULL,
        "method" TEXT NOT NULL,
        "status" TEXT NOT NULL
      )
    `
    await prisma.$executeRaw`
      CREATE TABLE "PaymentAllocation" (
        "id" TEXT PRIMARY KEY,
        "paymentId" TEXT NOT NULL,
        "saleId" TEXT NOT NULL,
        "amountMinor" INTEGER NOT NULL
      )
    `
    await prisma.$executeRaw`
      CREATE TABLE "SaleItem" (
        "id" TEXT PRIMARY KEY,
        "saleId" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL
      )
    `

    await prisma.$executeRaw`
      INSERT INTO "Customer" ("id", "organizationId", "name")
      VALUES ('customer-a', 'org-a', 'Ana Cocina'),
        ('customer-b', 'org-b', 'Ana Cocina')
    `
    await prisma.$executeRaw`
      INSERT INTO "Sale"
        ("id", "organizationId", "createdAt", "customerId", "orderType", "status", "total", "currency")
      VALUES
        ('sale-a', 'org-a', '2026-10-05T12:00:00.000Z', 'customer-a', 'DINE_IN', 'COMPLETED', 20, 'MXN'),
        ('sale-b', 'org-a', '2026-10-05T12:00:00.000Z', NULL, 'TAKEOUT', 'COMPLETED', 10, 'USD'),
        ('sale-c', 'org-a', '2026-10-04T12:00:00.000Z', 'customer-a', 'DELIVERY', 'VOID', 5, 'MXN'),
        ('sale-zero', 'org-a', '2026-10-03T12:00:00.000Z', NULL, 'DINE_IN', 'COMPLETED', 0, 'MXN'),
        ('sale-other-org', 'org-b', '2026-10-05T12:00:00.000Z', 'customer-b', 'DINE_IN', 'COMPLETED', 20, 'MXN')
    `
    await prisma.$executeRaw`
      INSERT INTO "Payment" ("id", "organizationId", "method", "status")
      VALUES
        ('payment-card', 'org-a', 'CARD', 'ACTIVE'),
        ('payment-cash-void', 'org-a', 'CASH', 'VOID'),
        ('payment-transfer', 'org-a', 'TRANSFER', 'ACTIVE'),
        ('payment-legacy', 'org-a', 'LEGACY', 'ACTIVE'),
        ('payment-other-org', 'org-b', 'CARD', 'ACTIVE')
    `
    await prisma.$executeRaw`
      INSERT INTO "PaymentAllocation" ("id", "paymentId", "saleId", "amountMinor")
      VALUES
        ('allocation-a-card', 'payment-card', 'sale-a', 1000),
        ('allocation-a-cash', 'payment-cash-void', 'sale-a', 700),
        ('allocation-b-transfer', 'payment-transfer', 'sale-b', 1000),
        ('allocation-c-legacy', 'payment-legacy', 'sale-c', 500),
        ('allocation-other-org', 'payment-other-org', 'sale-other-org', 2000)
    `
    await prisma.$executeRaw`
      INSERT INTO "SaleItem" ("id", "saleId", "quantity")
      VALUES
        ('item-a-1', 'sale-a', 2),
        ('item-a-2', 'sale-a', 1),
        ('item-b-1', 'sale-b', 4)
    `
  })

  afterEach(async () => {
    await prisma.$disconnect()
  })

  async function queryTransactions({
    search = "range=all",
    page = 1,
    pageSize = 25,
    organizationId = "org-a"
  }: {
    search?: string
    page?: number
    pageSize?: number
    organizationId?: string
  } = {}) {
    const parsed = parseSalesTransactionsSearchParams(
      new URLSearchParams(search),
      testNow
    )
    if (!parsed.valid) throw new Error(parsed.error)

    const rows = await prisma.$queryRaw<SqlRow[]>(
      buildSalesTransactionsSql({
        organizationId,
        filters: parsed.filters,
        page,
        pageSize
      })
    )

    return {
      rows: rows.filter(
        (row): row is SqlRow & { id: string } => row.id !== null
      ),
      totalCount: Number(rows[0]?.total_count ?? 0)
    }
  }

  it("counts and paginates organization sales without multiplying split payments or items", async () => {
    const firstPage = await queryTransactions({ pageSize: 2 })
    expect(firstPage.totalCount).toBe(4)
    expect(firstPage.rows.map(row => row.id)).toEqual(["sale-b", "sale-a"])
    expect(firstPage.rows[1]).toMatchObject({
      item_count: 3,
      paid_minor: 1000
    })

    const secondPage = await queryTransactions({ page: 2, pageSize: 2 })
    expect(secondPage.totalCount).toBe(4)
    expect(secondPage.rows.map(row => row.id)).toEqual(["sale-c", "sale-zero"])
  })

  it("filters derived payment status and matches any historical payment method", async () => {
    const partialCash = await queryTransactions({
      search: "range=all&paymentStatus=PARTIAL&paymentMethod=CASH"
    })
    expect(partialCash.totalCount).toBe(1)
    expect(partialCash.rows.map(row => row.id)).toEqual(["sale-a"])

    const legacy = await queryTransactions({
      search: "range=all&paymentMethod=LEGACY"
    })
    expect(legacy.rows.map(row => row.id)).toEqual(["sale-c"])

    const paid = await queryTransactions({
      search: "range=all&paymentStatus=PAID"
    })
    expect(paid.totalCount).toBe(3)
    expect(paid.rows.map(row => row.id)).toEqual([
      "sale-b",
      "sale-c",
      "sale-zero"
    ])
  })

  it("combines date and customer search filters and isolates organizations", async () => {
    const customRange = await queryTransactions({
      search: "range=custom&from=2026-10-05&to=2026-10-05&q=ana"
    })
    expect(customRange.totalCount).toBe(1)
    expect(customRange.rows.map(row => row.id)).toEqual(["sale-a"])

    const otherOrganization = await queryTransactions({
      search: "range=all",
      organizationId: "org-b"
    })
    expect(otherOrganization.totalCount).toBe(1)
    expect(otherOrganization.rows.map(row => row.id)).toEqual([
      "sale-other-org"
    ])
  })

  it("matches only the selected sale's payment methods and voided methods", async () => {
    const rows = await queryTransactions({ search: "range=all" })
    const sale = rows.rows.find(row => row.id === "sale-a")

    expect(sale?.payment_methods?.split(",")).toEqual(
      expect.arrayContaining(["CARD", "CASH"])
    )
    expect(sale?.voided_payment_methods).toBe("CASH")
  })
})
