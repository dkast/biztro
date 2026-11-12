import { performance } from "node:perf_hooks"
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest"

import { getSalesClosingData } from "@/server/actions/sales/queries"
import prisma from "@/lib/prisma"

const measurements = vi.hoisted(() => {
  vi.stubEnv("TZ", "UTC")
  return {
    statements: [] as Array<{ query: string; duration: number }>,
    operations: [] as Array<{
      name: string
      resultRows: number
      durationMs: number
    }>
  }
})

vi.mock("@/lib/prisma", async () => {
  const { PrismaClient } = await import("@/generated/prisma-client/client")
  const { PrismaLibSql } = await import("@prisma/adapter-libsql")
  const client = new PrismaClient({
    adapter: new PrismaLibSql({ url: "file::memory:" }),
    log: [{ emit: "event", level: "query" }]
  })
  client.$on("query", event => {
    measurements.statements.push({
      query: event.query,
      duration: event.duration
    })
  })
  return {
    default: client.$extends({
      query: {
        async $allOperations({ model, operation, args, query }) {
          const startedAt = performance.now()
          const result = await query(args)
          measurements.operations.push({
            name: model ? `${model}.${operation}` : operation,
            resultRows: Array.isArray(result)
              ? result.length
              : result === null
                ? 0
                : 1,
            durationMs: Math.round(performance.now() - startedAt)
          })
          return result
        }
      }
    })
  }
})

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn()
}))

vi.mock("@/lib/utils", () => ({
  getCacheBustedImageUrl: (url: string) => url
}))

beforeAll(async () => {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE Sale (
      id TEXT PRIMARY KEY, organizationId TEXT, customerId TEXT,
      status TEXT, orderType TEXT, currency TEXT, total REAL, createdAt DATETIME
    )
  `)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE Payment (
      id TEXT PRIMARY KEY, organizationId TEXT, status TEXT, origin TEXT,
      currency TEXT, amountMinor INTEGER, method TEXT, createdAt DATETIME
    )
  `)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE PaymentAllocation (
      id TEXT PRIMARY KEY, saleId TEXT, paymentId TEXT, amountMinor INTEGER
    )
  `)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE SaleItem (
      id TEXT PRIMARY KEY, saleId TEXT, productName TEXT,
      quantity INTEGER, lineTotal REAL
    )
  `)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE Location (
      id TEXT PRIMARY KEY, organizationId TEXT, currency TEXT, createdAt DATETIME
    )
  `)
})

beforeEach(async () => {
  for (const table of ["PaymentAllocation", "SaleItem", "Payment", "Sale"]) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`)
  }
  measurements.statements.length = 0
  measurements.operations.length = 0
})

afterAll(async () => {
  await prisma.$disconnect()
  vi.unstubAllEnvs()
})

async function addSale(
  id: string,
  date: string,
  total: number,
  {
    organizationId = "org",
    customerId = "customer",
    currency = "MXN",
    status = "COMPLETED"
  } = {}
) {
  await prisma.$executeRaw`
    INSERT INTO Sale VALUES (
      ${id}, ${organizationId}, ${customerId}, ${status}, 'DINE_IN',
      ${currency}, ${total}, ${new Date(date)}
    )
  `
}

async function addPayment(
  id: string,
  saleId: string,
  date: string,
  amountMinor: number,
  { origin = "SALE", status = "ACTIVE" } = {}
) {
  await prisma.$executeRaw`
    INSERT INTO Payment VALUES (
      ${id}, 'org', ${status}, ${origin}, 'MXN', ${amountMinor}, 'CASH',
      ${new Date(date)}
    )
  `
  await prisma.$executeRaw`
    INSERT INTO PaymentAllocation VALUES (
      ${`allocation-${id}`}, ${saleId}, ${id}, ${amountMinor}
    )
  `
}

describe("closing report query baseline", () => {
  it("preserves the complete report across two-day boundaries", async () => {
    await addSale("previous", "2026-10-29T00:00:00Z", 50)
    await addSale("today", "2026-10-30T00:00:00Z", 100)
    await addSale("tomorrow", "2026-10-31T00:00:00Z", 900)
    await addSale("too-old", "2026-10-28T23:59:59Z", 800)
    await addSale("other-org", "2026-10-30T00:00:00Z", 700, {
      organizationId: "other"
    })
    await addSale("other-currency", "2026-10-30T00:00:00Z", 600, {
      currency: "USD"
    })
    await addSale("voided", "2026-10-30T00:00:00Z", 30, { status: "VOID" })
    await addPayment("previous-paid", "previous", "2026-10-29T00:00:00Z", 5000)
    await addPayment("deposit", "today", "2026-10-30T00:00:00Z", 4000)
    await addPayment("collected", "today", "2026-10-30T00:30:00Z", 6000, {
      origin: "RECEIVABLE"
    })
    await addPayment("void-payment", "today", "2026-10-30T00:30:00Z", 1000, {
      status: "VOID"
    })
    await addPayment("tomorrow-paid", "tomorrow", "2026-10-31T00:00:00Z", 90000)
    await prisma.$executeRaw`
      INSERT INTO SaleItem VALUES ('item', 'today', 'Taco', 2, 100)
    `

    measurements.statements.length = 0
    measurements.operations.length = 0
    const startedAt = performance.now()
    const report = await getSalesClosingData("org", "2026-10-30")
    console.info("Closing fixture measurement", {
      reportMs: Math.round(performance.now() - startedAt),
      statements: measurements.statements.length,
      summedStatementMs: measurements.statements.reduce(
        (sum, row) => sum + row.duration,
        0
      ),
      statementMs: measurements.statements.map(row => row.duration),
      operations: measurements.operations
    })

    expect(report).toMatchSnapshot()
    expect(measurements.statements).toHaveLength(13)
    expect(measurements.operations).toHaveLength(8)
    expect(report.todaySales).toBe(100)
    expect(report.previous.sales).toBe(50)
    expect(report.todayCollected).toBe(100)
    expect(report.todayCreditGenerated).toBe(60)
    expect(report.hasCreditHistory).toBe(true)

    const nextDayReport = await getSalesClosingData("org", "2026-10-31")
    expect(nextDayReport.todaySales).toBe(900)
    expect(nextDayReport.todayCollected).toBe(900)
    expect(nextDayReport.previous.sales).toBe(100)
    expect(nextDayReport.previous.collected).toBe(100)
    expect(nextDayReport.previous.creditGenerated).toBe(60)
    expect(await getSalesClosingData("org", "2026-10-30")).toEqual(report)
  })

  it("returns an empty report for an organization without sales", async () => {
    expect(await getSalesClosingData("empty", "2026-10-30")).toMatchSnapshot()
  })

  it("does not query the database for a missing organization", async () => {
    const report = await getSalesClosingData("", "2026-10-30")
    expect(report.todaySales).toBe(0)
    expect(report.hasCreditHistory).toBe(false)
    expect(measurements.statements).toHaveLength(0)
  })

  it.each([
    { name: "unpaid credit", total: 0.29, payments: [], expected: true },
    {
      name: "fully paid at sale through multiple allocations",
      total: 0.29,
      payments: [
        { amount: 10, origin: "SALE", status: "ACTIVE" },
        { amount: 19, origin: "SALE", status: "ACTIVE" }
      ],
      expected: false
    },
    {
      name: "historical credit subsequently settled",
      total: 100,
      payments: [
        { amount: 4000, origin: "SALE", status: "ACTIVE" },
        { amount: 6000, origin: "RECEIVABLE", status: "ACTIVE" }
      ],
      expected: true
    },
    {
      name: "voided original payment",
      total: 100,
      payments: [{ amount: 10000, origin: "SALE", status: "VOID" }],
      expected: true
    },
    {
      name: "overpaid original sale",
      total: 100,
      payments: [{ amount: 11000, origin: "SALE", status: "ACTIVE" }],
      expected: false
    },
    { name: "zero-total sale", total: 0, payments: [], expected: false }
  ])(
    "preserves credit history for $name",
    async ({ total, payments, expected }) => {
      await addSale("historical", "2020-01-01T00:00:00Z", total)
      for (const [index, payment] of payments.entries()) {
        await addPayment(
          `payment-${index}`,
          "historical",
          "2020-01-01T00:00:00Z",
          payment.amount,
          payment
        )
      }

      const report = await getSalesClosingData("org", "2026-10-30")
      expect(report.hasCreditHistory).toBe(expected)
      expect(report.todaySales).toBe(0)
    }
  )

  it("keeps credit history organization-wide and currency-independent", async () => {
    await addSale("usd-credit", "2020-01-01T00:00:00Z", 50, {
      currency: "USD"
    })
    await addSale("latest-mxn", "2026-10-30T00:00:00Z", 0)
    const report = await getSalesClosingData("org", "2026-10-30")
    expect(report.currency).toBe("MXN")
    expect(report.hasCreditHistory).toBe(true)
  })

  it("excludes voided, anonymous and other-organization credit", async () => {
    await addSale("void-credit", "2020-01-01T00:00:00Z", 100, {
      status: "VOID"
    })
    await addSale("anonymous", "2020-01-01T00:00:00Z", 100)
    await prisma.$executeRaw`UPDATE Sale SET customerId = NULL WHERE id = 'anonymous'`
    await addSale("foreign", "2020-01-01T00:00:00Z", 100, {
      organizationId: "other"
    })
    expect(
      (await getSalesClosingData("org", "2026-10-30")).hasCreditHistory
    ).toBe(false)
    expect(
      (await getSalesClosingData("org' OR 1=1 --", "2026-10-30"))
        .hasCreditHistory
    ).toBe(false)
  })
})
