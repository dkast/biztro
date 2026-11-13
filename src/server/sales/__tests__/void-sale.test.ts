import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { PrismaClient } from "@/generated/prisma-client/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

import { voidSaleRecord } from "@/server/sales/void-sale"

vi.mock("server-only", () => ({}))
vi.mock("@/lib/prisma", () => ({ default: {} }))

const directory = mkdtempSync(join(tmpdir(), "biztro-void-sale-"))
const db = new PrismaClient({
  adapter: new PrismaLibSql({ url: `file:${join(directory, "test.db")}` })
})

beforeAll(async () => {
  await db.$executeRawUnsafe(`
    CREATE TABLE Sale (
      id TEXT PRIMARY KEY, organizationId TEXT, status TEXT,
      voidedAt DATETIME, voidedByUserId TEXT, voidReason TEXT, updatedAt DATETIME
    )
  `)
  await db.$executeRawUnsafe(`
    CREATE TABLE Payment (
      id TEXT PRIMARY KEY, organizationId TEXT, status TEXT,
      voidedAt DATETIME, voidedByUserId TEXT, voidReason TEXT
    )
  `)
  await db.$executeRawUnsafe(`
    CREATE TABLE PaymentAllocation (
      id TEXT PRIMARY KEY, paymentId TEXT, saleId TEXT
    )
  `)
  await db.$executeRawUnsafe(`
    CREATE TABLE "Order" (
      id TEXT PRIMARY KEY, organizationId TEXT, saleId TEXT,
      status TEXT, kitchenStatus TEXT, cancelledAt DATETIME,
      cancelledByUserId TEXT, cancelReason TEXT,
      cancellationAcknowledgedAt DATETIME, updatedAt DATETIME,
      number INTEGER DEFAULT 1, paymentTiming TEXT DEFAULT 'PAY_FIRST',
      orderType TEXT DEFAULT 'DINE_IN', currency TEXT DEFAULT 'MXN',
      total REAL DEFAULT 100, label TEXT, notes TEXT, requestId TEXT,
      submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP, preparingAt DATETIME,
      readyAt DATETIME, settledAt DATETIME, createdByUserId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
})

afterAll(async () => {
  await db.$disconnect()
  rmSync(directory, { recursive: true, force: true })
})

describe("prepaid cancellation with Prisma and LibSQL", () => {
  it("keeps a READY sale and payment active until the kitchen confirms", async () => {
    await db.$executeRaw`
      INSERT INTO Sale (id, organizationId, status)
      VALUES ('sale', 'org', 'COMPLETED')
    `
    await db.$executeRaw`
      INSERT INTO Payment (id, organizationId, status)
      VALUES ('payment', 'org', 'ACTIVE')
    `
    await db.$executeRaw`
      INSERT INTO PaymentAllocation (id, paymentId, saleId)
      VALUES ('allocation', 'payment', 'sale')
    `
    await db.$executeRaw`
      INSERT INTO "Order" (id, organizationId, saleId, status, kitchenStatus)
      VALUES ('order', 'org', 'sale', 'SETTLED', 'READY')
    `
    const request = {
      organizationId: "org",
      saleId: "sale",
      userId: "requester",
      reason: "Cliente canceló",
      voidedAt: new Date("2026-11-12T12:00:00Z")
    }

    const pending = await db.$transaction(tx =>
      voidSaleRecord(tx, { ...request, waitForKitchen: true })
    )

    expect(pending).toEqual({
      blocked: false,
      count: 1,
      cancellationPending: true
    })
    expect(
      await db.order.findFirst({
        select: { status: true, cancellationAcknowledgedAt: true }
      })
    ).toEqual({ status: "CANCELLED", cancellationAcknowledgedAt: null })
    expect(await db.sale.findFirst({ select: { status: true } })).toEqual({
      status: "COMPLETED"
    })
    expect(await db.payment.findFirst({ select: { status: true } })).toEqual({
      status: "ACTIVE"
    })

    const acknowledgedAt = new Date("2026-11-12T12:01:00Z")
    await db.$transaction(async tx => {
      const finalized = await voidSaleRecord(tx, {
        ...request,
        voidedAt: acknowledgedAt
      })
      expect(finalized).toEqual({
        blocked: false,
        count: 1,
        cancellationPending: false
      })
      await tx.order.updateMany({
        where: { id: "order", cancellationAcknowledgedAt: null },
        data: { cancellationAcknowledgedAt: acknowledgedAt }
      })
    })

    const auditSelect = {
      status: true,
      voidedAt: true,
      voidedByUserId: true,
      voidReason: true
    } as const
    const expectedAudit = {
      status: "VOID",
      voidedAt: acknowledgedAt,
      voidedByUserId: "requester",
      voidReason: "Cliente canceló"
    }
    expect(await db.sale.findFirst({ select: auditSelect })).toEqual(
      expectedAudit
    )
    expect(await db.payment.findFirst({ select: auditSelect })).toEqual(
      expectedAudit
    )
    expect(
      await db.order.count({
        where: { status: "CANCELLED", cancellationAcknowledgedAt: null }
      })
    ).toBe(0)
  })
})
