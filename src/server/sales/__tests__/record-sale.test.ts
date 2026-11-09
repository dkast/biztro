import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  createOrderRecord,
  recordSale,
  type SnapshotItem
} from "@/server/sales/record-sale"
import prisma from "@/lib/prisma"

const mocks = vi.hoisted(() => ({
  organization: { findUnique: vi.fn() },
  sale: { create: vi.fn() },
  order: { findFirst: vi.fn(), create: vi.fn() },
  payment: { create: vi.fn() }
}))

vi.mock("server-only", () => ({}))
vi.mock("@/lib/prisma", () => ({ default: mocks }))

const item: SnapshotItem = {
  menuItemId: "item-1",
  variantId: "variant-1",
  productName: "Flautas",
  variantName: "Regular",
  notes: "Sin cebolla",
  unitPrice: 98,
  quantity: 1,
  lineTotal: 98
}

describe("item note persistence", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.organization.findUnique.mockResolvedValue({
      acceptsCash: true,
      creditEnabled: false
    })
    mocks.sale.create.mockResolvedValue({
      id: "sale-1",
      orderType: "DINE_IN",
      total: 98
    })
    mocks.order.findFirst.mockResolvedValue({ number: 10 })
    mocks.order.create.mockResolvedValue({
      id: "order-1",
      number: 11,
      saleId: "sale-1"
    })
  })

  it.each(["Sin cebolla", null])(
    "excludes item notes (%s) from the sales-history write",
    async notes => {
      const result = await recordSale(prisma, {
        organizationId: "org-1",
        userId: "user-1",
        orderType: "DINE_IN",
        currency: "MXN",
        total: 98,
        items: [{ ...item, notes }],
        payments: [{ method: "CASH", amount: 98 }],
        balanceMinor: 0
      })

      expect(result).toHaveProperty("success.id", "sale-1")
      const { notes: _notes, ...saleItem } = item
      expect(mocks.sale.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            items: { create: [saleItem] }
          })
        })
      )
      expect(mocks.payment.create).toHaveBeenCalledOnce()
    }
  )

  it.each(["sale-1", undefined])(
    "persists notes on the kitchen order with saleId %s",
    async saleId => {
      await createOrderRecord(prisma, {
        organizationId: "org-1",
        userId: "user-1",
        paymentTiming: saleId ? "PAY_FIRST" : "PAY_ON_DELIVERY",
        orderType: "DINE_IN",
        currency: "MXN",
        total: 98,
        items: [item],
        label: null,
        notes: "Mesa junto a la ventana",
        requestId: "request-1",
        saleId
      })

      expect(mocks.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            notes: "Mesa junto a la ventana",
            items: { create: [item] }
          })
        })
      )
    }
  )
})
