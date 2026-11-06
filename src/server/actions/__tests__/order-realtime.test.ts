import { Prisma } from "@/generated/prisma-client/client"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { z } from "zod/v4"

import {
  acknowledgeOrderCancellation,
  advanceKitchenOrder,
  cancelOrder,
  restoreKitchenOrder,
  settleOrder,
  submitOrder
} from "@/server/actions/orders/mutations"
import { saveOrganizationPaymentSettings } from "@/server/actions/organization/mutations"
import { completeSale, voidSale } from "@/server/actions/sales/mutations"
import type * as RecordSale from "@/server/sales/record-sale"

const ORG_ID = "org_realtime"
const USER_ID = "user_realtime"

type MockMember = {
  organizationId: string | null
  role: string
  user: { id: string }
}

const mocks = vi.hoisted(() => {
  const memberState: { member: MockMember } = {
    member: {
      organizationId: "org_realtime",
      role: "owner",
      user: { id: "user_realtime" }
    }
  }

  return {
    memberState,
    publishOrderChange: vi.fn(),
    updateTag: vi.fn(),
    refresh: vi.fn(),
    isProMember: vi.fn(),
    captureException: vi.fn(),
    resolveCatalogItems: vi.fn(),
    recordSale: vi.fn(),
    createOrderRecord: vi.fn(),
    cancelLinkedKitchenOrder: vi.fn(),
    db: {
      $transaction: vi.fn(),
      order: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        updateMany: vi.fn(),
        update: vi.fn()
      },
      organization: { findUnique: vi.fn(), update: vi.fn() },
      sale: { findMany: vi.fn(), updateMany: vi.fn() },
      payment: { findMany: vi.fn(), updateMany: vi.fn() }
    }
  }
})

vi.mock("server-only", () => ({}))
vi.mock("next/cache", () => ({
  updateTag: mocks.updateTag,
  refresh: mocks.refresh
}))
vi.mock("next/headers", () => ({ headers: vi.fn() }))
vi.mock("@sentry/nextjs", () => ({ captureException: mocks.captureException }))
vi.mock("@/lib/prisma", () => ({ default: mocks.db }))
vi.mock("@/lib/auth", () => ({ auth: {} }))
vi.mock("@/lib/r2", () => ({ deleteOrganizationAssetsFromR2: vi.fn() }))
vi.mock("@/server/actions/organization/queries", () => ({
  getOrganizationBySlug: vi.fn()
}))
vi.mock("@/server/actions/subscriptions/queries", () => ({
  getCurrentSubscription: vi.fn()
}))
vi.mock("@/server/actions/user/queries", () => ({
  isProMember: mocks.isProMember
}))
vi.mock("@/server/orders/realtime", () => ({
  publishOrderChange: mocks.publishOrderChange
}))
vi.mock("@/server/sales/orders", () => ({
  cancelLinkedKitchenOrder: mocks.cancelLinkedKitchenOrder
}))
vi.mock("@/server/sales/record-sale", async importOriginal => ({
  ...(await importOriginal<typeof RecordSale>()),
  resolveCatalogItems: mocks.resolveCatalogItems,
  recordSale: mocks.recordSale,
  createOrderRecord: mocks.createOrderRecord
}))
vi.mock("@/lib/safe-actions", () => {
  const client = {
    inputSchema: <Schema extends z.ZodType>(schema: Schema) => ({
      action:
        <Result>(
          handler: (args: {
            parsedInput: z.output<Schema>
            ctx: { member: MockMember }
          }) => Promise<Result>
        ) =>
        async (input: z.input<Schema>) => ({
          data: await handler({
            parsedInput: schema.parse(input),
            ctx: { member: mocks.memberState.member }
          })
        })
    })
  }

  return {
    actionClient: client,
    authActionClient: client,
    authMemberActionClient: client
  }
})

const {
  db,
  publishOrderChange,
  updateTag,
  refresh,
  isProMember,
  captureException,
  resolveCatalogItems,
  recordSale,
  createOrderRecord,
  cancelLinkedKitchenOrder
} = mocks

const catalog = {
  currency: "MXN",
  total: 100,
  items: [
    {
      menuItemId: "item_1",
      variantId: null,
      productName: "Taco",
      variantName: null,
      unitPrice: 50,
      quantity: 2,
      lineTotal: 100
    }
  ]
}

const submitInput = {
  requestId: "request-12345",
  items: [{ menuItemId: "item_1", quantity: 2 }]
}

const fullPayment = [{ method: "CASH" as const, amount: 100 }]

const paymentSettings = {
  acceptsCash: true,
  acceptsCard: true,
  acceptsTransfer: false,
  acceptsCodi: false,
  acceptsVoucher: false,
  creditEnabled: true,
  paymentTiming: "PAY_FIRST" as const
}

function duplicateRequestError() {
  return new Prisma.PrismaClientKnownRequestError("duplicate", {
    code: "P2002",
    clientVersion: "test",
    meta: { target: ["organizationId", "requestId"] }
  })
}

function lastOrder(mock: { mock: { invocationCallOrder: number[] } }) {
  return mock.mock.invocationCallOrder.at(-1) ?? 0
}

// Realtime must fire only once the write committed and caches were invalidated.
function expectPublishedAfterInvalidation(
  reason: string,
  tag = `orders-${ORG_ID}`
) {
  expect(publishOrderChange).toHaveBeenCalledExactlyOnceWith(ORG_ID, reason)
  expect(updateTag).toHaveBeenCalledWith(tag)
  expect(lastOrder(publishOrderChange)).toBeGreaterThan(lastOrder(updateTag))
  expect(lastOrder(publishOrderChange)).toBeGreaterThan(
    lastOrder(db.$transaction)
  )
}

beforeEach(() => {
  vi.resetAllMocks()
  mocks.memberState.member = {
    organizationId: ORG_ID,
    role: "owner",
    user: { id: USER_ID }
  }
  publishOrderChange.mockResolvedValue(undefined)
  isProMember.mockResolvedValue(true)
  db.$transaction.mockImplementation(
    async (run: (tx: typeof db) => Promise<unknown>) => run(db)
  )
  resolveCatalogItems.mockResolvedValue(catalog)
  db.order.findUnique.mockResolvedValue(null)
  db.organization.findUnique.mockResolvedValue({
    paymentTiming: "PAY_ON_DELIVERY"
  })
})

describe("submitOrder realtime publication (pay on delivery)", () => {
  beforeEach(() => {
    createOrderRecord.mockResolvedValue({ id: "order_1", number: 7 })
  })

  it("publishes created after a successful creation", async () => {
    const result = await submitOrder({ ...submitInput, label: " Mesa 4 " })

    expect(result).toEqual({
      data: { success: { id: "order_1", number: 7 } }
    })
    expect(createOrderRecord).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        organizationId: ORG_ID,
        userId: USER_ID,
        paymentTiming: "PAY_ON_DELIVERY",
        label: "Mesa 4",
        requestId: submitInput.requestId
      })
    )
    expectPublishedAfterInvalidation("created")
  })

  it("does not publish for non-Pro organizations", async () => {
    isProMember.mockResolvedValue(false)

    const result = await submitOrder(submitInput)

    expect(result.data).toEqual({
      failure: { reason: "Enviar órdenes requiere el plan Pro" }
    })
    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("does not publish without an active organization", async () => {
    mocks.memberState.member.organizationId = null

    const result = await submitOrder(submitInput)

    expect(result.data).toHaveProperty("failure")
    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("does not publish for a duplicate requestId", async () => {
    db.order.findUnique.mockResolvedValue({ id: "order_1", number: 7 })

    const result = await submitOrder(submitInput)

    expect(result.data).toEqual({ success: { id: "order_1", number: 7 } })
    expect(db.$transaction).not.toHaveBeenCalled()
    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("does not publish when a concurrent duplicate wins the race", async () => {
    db.order.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "order_1", number: 7 })
    createOrderRecord.mockRejectedValue(duplicateRequestError())

    const result = await submitOrder(submitInput)

    expect(result.data).toEqual({ success: { id: "order_1", number: 7 } })
    expect(publishOrderChange).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })

  it("does not publish when the catalog cannot be resolved", async () => {
    resolveCatalogItems.mockResolvedValue({ failure: "Producto no disponible" })

    const result = await submitOrder(submitInput)

    expect(result.data).toEqual({
      failure: { reason: "Producto no disponible" }
    })
    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("does not publish when the organization now charges up front", async () => {
    db.organization.findUnique.mockResolvedValue({ paymentTiming: "PAY_FIRST" })

    const result = await submitOrder(submitInput)

    expect(result.data).toHaveProperty("failure")
    expect(createOrderRecord).not.toHaveBeenCalled()
    expect(publishOrderChange).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })

  it("does not publish when the transaction rolls back", async () => {
    createOrderRecord.mockRejectedValue(new Error("db down"))

    await expect(submitOrder(submitInput)).rejects.toThrow("db down")

    expect(publishOrderChange).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })
})

describe("completeSale realtime publication (pay first)", () => {
  const saleInput = {
    requestId: "request-12345",
    items: [{ menuItemId: "item_1", quantity: 2 }],
    payments: fullPayment
  }

  beforeEach(() => {
    db.organization.findUnique.mockResolvedValue({ paymentTiming: "PAY_FIRST" })
    recordSale.mockResolvedValue({
      success: { id: "sale_1", orderType: "DINE_IN", total: 100 }
    })
    createOrderRecord.mockResolvedValue({ id: "order_1", number: 9 })
  })

  it("publishes created after a successful sale", async () => {
    const result = await completeSale(saleInput)

    expect(result.data).toEqual({
      success: {
        id: "sale_1",
        orderType: "DINE_IN",
        total: 100,
        itemCount: 2,
        orderNumber: 9
      }
    })
    expect(createOrderRecord).toHaveBeenCalledWith(
      db,
      expect.objectContaining({ paymentTiming: "PAY_FIRST", saleId: "sale_1" })
    )
    expect(updateTag).toHaveBeenCalledWith(`sales-${ORG_ID}`)
    expectPublishedAfterInvalidation("created")
  })

  it("publishes created for sales without a requestId", async () => {
    await completeSale({ items: saleInput.items, payments: fullPayment })

    expectPublishedAfterInvalidation("created")
    expect(db.order.findUnique).not.toHaveBeenCalled()
  })

  it("invalidates the customer cache before publishing credit sales", async () => {
    await completeSale({
      ...saleInput,
      customerId: "customer_1",
      payments: [{ method: "CASH", amount: 40 }],
      acceptsCredit: true
    })

    expect(updateTag).toHaveBeenCalledWith("customer-customer_1")
    expectPublishedAfterInvalidation("created")
  })

  it("does not publish for non-Pro organizations", async () => {
    isProMember.mockResolvedValue(false)

    const result = await completeSale(saleInput)

    expect(result.data).toHaveProperty("failure")
    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("does not publish for a duplicate requestId", async () => {
    db.order.findUnique.mockResolvedValue({
      number: 9,
      sale: { id: "sale_1", orderType: "DINE_IN", total: 100 },
      items: [{ quantity: 2 }]
    })

    const result = await completeSale(saleInput)

    expect(result.data).toEqual({
      success: {
        id: "sale_1",
        orderType: "DINE_IN",
        total: 100,
        itemCount: 2,
        orderNumber: 9
      }
    })
    expect(db.$transaction).not.toHaveBeenCalled()
    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("does not publish when a concurrent duplicate wins the race", async () => {
    db.order.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
      number: 9,
      sale: { id: "sale_1", orderType: "DINE_IN", total: 100 },
      items: [{ quantity: 2 }]
    })
    recordSale.mockRejectedValue(duplicateRequestError())

    const result = await completeSale(saleInput)

    expect(result.data).toHaveProperty("success")
    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("does not publish when payments are invalid", async () => {
    const result = await completeSale({
      ...saleInput,
      payments: [{ method: "CASH", amount: 500 }]
    })

    expect(result.data).toHaveProperty("failure")
    expect(db.$transaction).not.toHaveBeenCalled()
    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("does not publish when the organization now charges on delivery", async () => {
    db.organization.findUnique.mockResolvedValue({
      paymentTiming: "PAY_ON_DELIVERY"
    })

    const result = await completeSale(saleInput)

    expect(result.data).toHaveProperty("failure")
    expect(recordSale).not.toHaveBeenCalled()
    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("does not publish when recording the sale fails", async () => {
    recordSale.mockResolvedValue({ failure: "Método no aceptado" })

    const result = await completeSale(saleInput)

    expect(result.data).toEqual({ failure: { reason: "Método no aceptado" } })
    expect(createOrderRecord).not.toHaveBeenCalled()
    expect(publishOrderChange).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })

  it("does not publish when the transaction rolls back", async () => {
    createOrderRecord.mockRejectedValue(new Error("db down"))

    await expect(completeSale(saleInput)).rejects.toThrow("db down")

    expect(publishOrderChange).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })
})

describe("voidSale realtime publication", () => {
  const voidInput = { saleId: "sale_1", reason: "WRONG_ITEMS" as const }

  beforeEach(() => {
    db.payment.findMany.mockResolvedValue([
      { id: "payment_1", allocations: [{ saleId: "sale_1" }] }
    ])
    db.sale.updateMany.mockResolvedValue({ count: 1 })
  })

  it("publishes cancellation after the sale and linked order are voided", async () => {
    const result = await voidSale(voidInput)

    expect(result.data).toEqual({ success: { id: "sale_1" } })
    expect(cancelLinkedKitchenOrder).toHaveBeenCalledWith(
      db,
      expect.objectContaining({ organizationId: ORG_ID, saleId: "sale_1" })
    )
    expect(updateTag).toHaveBeenCalledWith("sale-sale_1")
    expectPublishedAfterInvalidation("cancellation")
    expect(lastOrder(publishOrderChange)).toBeGreaterThan(
      lastOrder(cancelLinkedKitchenOrder)
    )
  })

  it("does not publish when payments are shared with other sales", async () => {
    db.payment.findMany.mockResolvedValue([
      {
        id: "payment_1",
        allocations: [{ saleId: "sale_1" }, { saleId: "sale_2" }]
      }
    ])

    const result = await voidSale(voidInput)

    expect(result.data).toHaveProperty("failure")
    expect(db.sale.updateMany).not.toHaveBeenCalled()
    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("does not publish when the sale was already voided or is missing", async () => {
    db.sale.updateMany.mockResolvedValue({ count: 0 })

    const result = await voidSale(voidInput)

    expect(result.data).toHaveProperty("failure")
    expect(cancelLinkedKitchenOrder).not.toHaveBeenCalled()
    expect(publishOrderChange).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })

  it("does not publish when the transaction rolls back", async () => {
    cancelLinkedKitchenOrder.mockRejectedValue(new Error("db down"))

    await expect(voidSale(voidInput)).rejects.toThrow("db down")

    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("does not publish without an active organization", async () => {
    mocks.memberState.member.organizationId = null

    const result = await voidSale(voidInput)

    expect(result.data).toHaveProperty("failure")
    expect(publishOrderChange).not.toHaveBeenCalled()
  })
})

describe("kitchen order realtime publication", () => {
  it("publishes preparation when an order starts preparing", async () => {
    db.order.updateMany.mockResolvedValue({ count: 1 })

    const result = await advanceKitchenOrder({
      orderId: "order_1",
      from: "NEW"
    })

    expect(result.data).toEqual({
      success: { orderId: "order_1", kitchenStatus: "PREPARING" }
    })
    expect(db.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "order_1",
          organizationId: ORG_ID,
          kitchenStatus: "NEW"
        })
      })
    )
    expect(publishOrderChange).toHaveBeenCalledExactlyOnceWith(
      ORG_ID,
      "preparation"
    )
    expect(updateTag).toHaveBeenCalledWith(`orders-${ORG_ID}`)
    expect(lastOrder(publishOrderChange)).toBeGreaterThan(lastOrder(updateTag))
    expect(refresh).toHaveBeenCalled()
  })

  it("publishes preparation when an order becomes ready", async () => {
    db.order.updateMany.mockResolvedValue({ count: 1 })

    const result = await advanceKitchenOrder({
      orderId: "order_1",
      from: "PREPARING"
    })

    expect(result.data).toEqual({
      success: { orderId: "order_1", kitchenStatus: "READY" }
    })
    expect(publishOrderChange).toHaveBeenCalledExactlyOnceWith(
      ORG_ID,
      "preparation"
    )
  })

  it("does not publish when a ready order is advanced", async () => {
    const result = await advanceKitchenOrder({
      orderId: "order_1",
      from: "READY"
    })

    expect(result.data).toEqual({
      failure: { reason: "La orden ya está lista" }
    })
    expect(db.order.updateMany).not.toHaveBeenCalled()
    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("does not publish when another screen already advanced the order", async () => {
    db.order.updateMany.mockResolvedValue({ count: 0 })
    db.order.findFirst.mockResolvedValue({
      status: "OPEN",
      kitchenStatus: "PREPARING"
    })

    const result = await advanceKitchenOrder({
      orderId: "order_1",
      from: "NEW"
    })

    expect(result.data).toEqual({
      success: { orderId: "order_1", kitchenStatus: "PREPARING" }
    })
    expect(publishOrderChange).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })

  it("does not publish for conflicting, cancelled or missing orders", async () => {
    db.order.updateMany.mockResolvedValue({ count: 0 })
    db.order.findFirst
      .mockResolvedValueOnce({ status: "OPEN", kitchenStatus: "READY" })
      .mockResolvedValueOnce({ status: "CANCELLED", kitchenStatus: "NEW" })
      .mockResolvedValueOnce(null)

    const conflict = await advanceKitchenOrder({
      orderId: "order_1",
      from: "NEW"
    })
    const cancelled = await advanceKitchenOrder({
      orderId: "order_1",
      from: "NEW"
    })
    const missing = await advanceKitchenOrder({
      orderId: "order_1",
      from: "NEW"
    })

    expect(conflict.data).toEqual({
      failure: { reason: "Otra pantalla ya cambió esta orden a lista" }
    })
    expect(cancelled.data).toEqual({
      failure: { reason: "La orden fue cancelada" }
    })
    expect(missing.data).toEqual({ failure: { reason: "La orden no existe" } })
    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("does not publish when the write fails", async () => {
    db.order.updateMany.mockRejectedValue(new Error("db down"))

    await expect(
      advanceKitchenOrder({ orderId: "order_1", from: "NEW" })
    ).rejects.toThrow("db down")

    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("publishes restored when a ready order returns to preparing", async () => {
    db.order.updateMany.mockResolvedValue({ count: 1 })

    const result = await restoreKitchenOrder({ orderId: "order_1" })

    expect(result.data).toEqual({
      success: { orderId: "order_1", kitchenStatus: "PREPARING" }
    })
    expect(db.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: ORG_ID,
          kitchenStatus: "READY"
        })
      })
    )
    expect(publishOrderChange).toHaveBeenCalledExactlyOnceWith(
      ORG_ID,
      "restored"
    )
    expect(lastOrder(publishOrderChange)).toBeGreaterThan(lastOrder(updateTag))
    expect(refresh).toHaveBeenCalled()
  })

  it("does not publish when the order cannot be restored", async () => {
    db.order.updateMany.mockResolvedValue({ count: 0 })
    db.order.findFirst.mockResolvedValue({
      status: "OPEN",
      kitchenStatus: "NEW"
    })

    const result = await restoreKitchenOrder({ orderId: "order_1" })

    expect(result.data).toHaveProperty("failure")
    expect(publishOrderChange).not.toHaveBeenCalled()
  })
})

describe("acknowledgeOrderCancellation realtime publication", () => {
  it("publishes acknowledged when a cancellation is newly acknowledged", async () => {
    db.order.updateMany.mockResolvedValue({ count: 1 })

    const result = await acknowledgeOrderCancellation({ orderId: "order_1" })

    expect(result.data).toEqual({ success: { orderId: "order_1" } })
    expect(db.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: ORG_ID,
          status: "CANCELLED",
          cancellationAcknowledgedAt: null
        })
      })
    )
    expect(publishOrderChange).toHaveBeenCalledExactlyOnceWith(
      ORG_ID,
      "acknowledged"
    )
    expect(lastOrder(publishOrderChange)).toBeGreaterThan(lastOrder(updateTag))
    expect(refresh).toHaveBeenCalled()
  })

  it("keeps succeeding without publishing when nothing changed", async () => {
    db.order.updateMany.mockResolvedValue({ count: 0 })

    const result = await acknowledgeOrderCancellation({ orderId: "order_1" })

    expect(result.data).toEqual({ success: { orderId: "order_1" } })
    expect(publishOrderChange).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
    expect(refresh).toHaveBeenCalled()
  })
})

describe("cancelOrder realtime publication", () => {
  const cancelInput = { orderId: "order_1", reason: "  Cliente se fue  " }

  beforeEach(() => {
    db.order.findFirst.mockResolvedValue({
      status: "OPEN",
      kitchenStatus: "NEW"
    })
    db.order.updateMany.mockResolvedValue({ count: 1 })
  })

  it("publishes cancellation after the order is cancelled", async () => {
    const result = await cancelOrder(cancelInput)

    expect(result.data).toEqual({ success: { orderId: "order_1" } })
    expect(db.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: ORG_ID,
          status: "OPEN"
        }),
        data: expect.objectContaining({
          status: "CANCELLED",
          cancelReason: "Cliente se fue",
          cancelledByUserId: USER_ID
        })
      })
    )
    expectPublishedAfterInvalidation("cancellation")
    expect(refresh).toHaveBeenCalled()
  })

  it.each([
    [null, "La orden no existe"],
    [{ status: "CANCELLED", kitchenStatus: "NEW" }, "La orden ya fue cancelada"]
  ])("does not publish for %j", async (order, reason) => {
    db.order.findFirst.mockResolvedValue(order)

    const result = await cancelOrder(cancelInput)

    expect(result.data).toEqual({ failure: { reason } })
    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("does not publish for settled orders", async () => {
    db.order.findFirst.mockResolvedValue({
      status: "SETTLED",
      kitchenStatus: "NEW"
    })

    const result = await cancelOrder(cancelInput)

    expect(result.data).toHaveProperty("failure")
    expect(db.order.updateMany).not.toHaveBeenCalled()
    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("does not publish when the order changed during cancellation", async () => {
    db.order.updateMany.mockResolvedValue({ count: 0 })

    const result = await cancelOrder(cancelInput)

    expect(result.data).toEqual({
      failure: { reason: "La orden cambió mientras se cancelaba" }
    })
    expect(publishOrderChange).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })

  it("does not publish when the transaction rolls back", async () => {
    db.order.updateMany.mockRejectedValue(new Error("db down"))

    await expect(cancelOrder(cancelInput)).rejects.toThrow("db down")

    expect(publishOrderChange).not.toHaveBeenCalled()
  })
})

describe("settleOrder realtime publication", () => {
  const settleInput = { orderId: "order_1", payments: fullPayment }

  const openOrder = {
    id: "order_1",
    number: 3,
    status: "OPEN",
    orderType: "DINE_IN",
    currency: "MXN",
    total: 100,
    items: [{ quantity: 1 }, { quantity: 2 }]
  }

  beforeEach(() => {
    db.order.findFirst.mockResolvedValue(openOrder)
    db.order.updateMany.mockResolvedValue({ count: 1 })
    db.order.update.mockResolvedValue({})
    recordSale.mockResolvedValue({
      success: { id: "sale_1", orderType: "DINE_IN", total: 100 }
    })
  })

  it("publishes settled after the order is charged", async () => {
    const result = await settleOrder(settleInput)

    expect(result.data).toEqual({
      success: {
        id: "sale_1",
        orderType: "DINE_IN",
        total: 100,
        itemCount: 3,
        orderNumber: 3
      }
    })
    expect(db.order.update).toHaveBeenCalledWith({
      where: { id: "order_1" },
      data: { saleId: "sale_1" }
    })
    expect(updateTag).toHaveBeenCalledWith(`sales-${ORG_ID}`)
    expectPublishedAfterInvalidation("settled")
    expect(refresh).toHaveBeenCalled()
  })

  it("invalidates the customer cache before publishing credit settlements", async () => {
    await settleOrder({
      orderId: "order_1",
      customerId: "customer_1",
      payments: [{ method: "CASH", amount: 40 }],
      acceptsCredit: true
    })

    expect(updateTag).toHaveBeenCalledWith("customer-customer_1")
    expectPublishedAfterInvalidation("settled")
  })

  it.each([
    [null, "La orden no existe"],
    [{ ...openOrder, status: "SETTLED" }, "Esta orden ya fue cobrada"],
    [{ ...openOrder, status: "CANCELLED" }, "Esta orden fue cancelada"]
  ])("does not publish for %j", async (order, reason) => {
    db.order.findFirst.mockResolvedValue(order)

    const result = await settleOrder(settleInput)

    expect(result.data).toEqual({ failure: { reason } })
    expect(db.$transaction).not.toHaveBeenCalled()
    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("does not publish when payments are invalid", async () => {
    const result = await settleOrder({
      orderId: "order_1",
      payments: [{ method: "CASH", amount: 500 }]
    })

    expect(result.data).toHaveProperty("failure")
    expect(db.$transaction).not.toHaveBeenCalled()
    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("does not publish when another screen claimed the order", async () => {
    db.order.updateMany.mockResolvedValue({ count: 0 })

    const result = await settleOrder(settleInput)

    expect(result.data).toEqual({
      failure: {
        reason: "La orden cambió en otra pantalla. Revisa Por cobrar."
      }
    })
    expect(recordSale).not.toHaveBeenCalled()
    expect(publishOrderChange).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })

  it("does not publish when recording the sale fails", async () => {
    recordSale.mockResolvedValue({ failure: "Método no aceptado" })

    const result = await settleOrder(settleInput)

    expect(result.data).toEqual({ failure: { reason: "Método no aceptado" } })
    expect(db.order.update).not.toHaveBeenCalled()
    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("reports unexpected failures without publishing", async () => {
    const error = new Error("db down")
    db.order.update.mockRejectedValue(error)

    await expect(settleOrder(settleInput)).rejects.toThrow("db down")

    expect(captureException).toHaveBeenCalledWith(error)
    expect(publishOrderChange).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })
})

describe("saveOrganizationPaymentSettings realtime publication", () => {
  beforeEach(() => {
    db.organization.findUnique.mockResolvedValue({
      id: ORG_ID,
      ...paymentSettings
    })
    db.organization.update.mockResolvedValue({})
    db.sale.findMany.mockResolvedValue([])
  })

  it("selects every payment setting used for change detection", async () => {
    await saveOrganizationPaymentSettings(paymentSettings)

    expect(db.organization.findUnique).toHaveBeenCalledWith({
      where: { id: ORG_ID },
      select: {
        id: true,
        acceptsCash: true,
        acceptsCard: true,
        acceptsTransfer: true,
        acceptsCodi: true,
        acceptsVoucher: true,
        creditEnabled: true,
        paymentTiming: true
      }
    })
  })

  it("publishes settings after changed settings are saved", async () => {
    const next = {
      ...paymentSettings,
      paymentTiming: "PAY_ON_DELIVERY" as const
    }

    const result = await saveOrganizationPaymentSettings(next)

    expect(result.data).toEqual({ success: true })
    expect(db.organization.update).toHaveBeenCalledWith({
      where: { id: ORG_ID },
      data: next
    })
    expect(updateTag).toHaveBeenCalledWith(`payment-settings-${ORG_ID}`)
    expectPublishedAfterInvalidation("settings", `payment-settings-${ORG_ID}`)
  })

  it.each([
    ["acceptsCash", { acceptsCash: false }],
    ["acceptsCard", { acceptsCard: false }],
    ["acceptsTransfer", { acceptsTransfer: true }],
    ["acceptsCodi", { acceptsCodi: true }],
    ["acceptsVoucher", { acceptsVoucher: true }],
    ["creditEnabled", { creditEnabled: false }],
    ["paymentTiming", { paymentTiming: "PAY_ON_DELIVERY" as const }]
  ])("treats a %s change as a change", async (_name, patch) => {
    await saveOrganizationPaymentSettings({ ...paymentSettings, ...patch })

    expect(db.organization.update).toHaveBeenCalled()
    expectPublishedAfterInvalidation("settings", `payment-settings-${ORG_ID}`)
  })

  it("does not write, invalidate or publish identical settings", async () => {
    const result = await saveOrganizationPaymentSettings(paymentSettings)

    expect(result.data).toEqual({ success: true })
    expect(db.organization.update).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("does not publish when the organization is missing", async () => {
    db.organization.findUnique.mockResolvedValue(null)

    const result = await saveOrganizationPaymentSettings(paymentSettings)

    expect(result.data).toHaveProperty("failure")
    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("does not publish when disabling credit with outstanding balances", async () => {
    db.sale.findMany.mockResolvedValue([
      {
        total: 100,
        paymentAllocations: [
          { amountMinor: 4000, payment: { status: "ACTIVE" } },
          { amountMinor: 6000, payment: { status: "VOID" } }
        ]
      }
    ])

    const result = await saveOrganizationPaymentSettings({
      ...paymentSettings,
      creditEnabled: false
    })

    expect(result.data).toHaveProperty("failure")
    expect(db.organization.update).not.toHaveBeenCalled()
    expect(publishOrderChange).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })

  it("publishes when credit is disabled and balances are settled", async () => {
    db.sale.findMany.mockResolvedValue([
      {
        total: 100,
        paymentAllocations: [
          { amountMinor: 10000, payment: { status: "ACTIVE" } }
        ]
      }
    ])

    await saveOrganizationPaymentSettings({
      ...paymentSettings,
      creditEnabled: false
    })

    expectPublishedAfterInvalidation("settings", `payment-settings-${ORG_ID}`)
  })

  it("does not publish for non-owners", async () => {
    mocks.memberState.member.role = "member"

    const result = await saveOrganizationPaymentSettings({
      ...paymentSettings,
      paymentTiming: "PAY_ON_DELIVERY"
    })

    expect(result.data).toHaveProperty("failure")
    expect(db.$transaction).not.toHaveBeenCalled()
    expect(publishOrderChange).not.toHaveBeenCalled()
  })

  it("does not publish when the update fails", async () => {
    db.organization.update.mockRejectedValue(new Error("db down"))

    await expect(
      saveOrganizationPaymentSettings({
        ...paymentSettings,
        paymentTiming: "PAY_ON_DELIVERY"
      })
    ).rejects.toThrow("db down")

    expect(publishOrderChange).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })
})
