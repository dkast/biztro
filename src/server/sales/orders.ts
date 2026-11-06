import "server-only"

import type { Prisma } from "@/generated/prisma-client/client"

import type { Currency } from "@/lib/currency"
import { kitchenReadyPageSize } from "@/lib/orders"
import prisma from "@/lib/prisma"
import type {
  KitchenBoardData,
  KitchenReadyPage,
  KitchenStatus,
  OrderStatus,
  OrderTicket,
  PaymentTiming,
  PendingOrdersData
} from "@/lib/types/order"
import type { SalesOrderType } from "@/lib/types/sales"

// Safety ceiling for a single board snapshot; far above realistic peak load.
const maxActiveOrders = 300

const ticketSelect = {
  id: true,
  number: true,
  status: true,
  kitchenStatus: true,
  paymentTiming: true,
  orderType: true,
  label: true,
  notes: true,
  submittedAt: true,
  preparingAt: true,
  readyAt: true,
  items: {
    orderBy: { createdAt: "asc" },
    select: { id: true, productName: true, variantName: true, quantity: true }
  }
} satisfies Prisma.OrderSelect

type TicketRow = Prisma.OrderGetPayload<{ select: typeof ticketSelect }>

function toTicket(order: TicketRow): OrderTicket {
  return {
    id: order.id,
    number: order.number,
    status: order.status as OrderStatus,
    kitchenStatus: order.kitchenStatus as KitchenStatus,
    paymentTiming: order.paymentTiming as PaymentTiming,
    orderType: order.orderType as SalesOrderType,
    label: order.label,
    notes: order.notes,
    submittedAt: order.submittedAt.toISOString(),
    preparingAt: order.preparingAt?.toISOString() ?? null,
    readyAt: order.readyAt?.toISOString() ?? null,
    items: order.items
  }
}

export async function getKitchenBoard(
  organizationId: string
): Promise<KitchenBoardData> {
  const [active, cancellations] = await Promise.all([
    prisma.order.findMany({
      where: {
        organizationId,
        status: { in: ["OPEN", "SETTLED"] },
        kitchenStatus: { in: ["NEW", "PREPARING"] }
      },
      orderBy: [{ submittedAt: "asc" }, { number: "asc" }],
      take: maxActiveOrders,
      select: ticketSelect
    }),
    prisma.order.findMany({
      where: {
        organizationId,
        status: "CANCELLED",
        cancellationAcknowledgedAt: null
      },
      orderBy: { cancelledAt: "asc" },
      take: 20,
      select: {
        id: true,
        number: true,
        label: true,
        cancelReason: true,
        cancelledAt: true
      }
    })
  ])

  return {
    serverTime: new Date().toISOString(),
    active: active.map(toTicket),
    cancellations: cancellations.map(order => ({
      id: order.id,
      number: order.number,
      label: order.label,
      cancelReason: order.cancelReason,
      cancelledAt: (order.cancelledAt ?? new Date()).toISOString()
    }))
  }
}

export async function getKitchenReadyOrders(
  organizationId: string,
  requestedPage: number
): Promise<KitchenReadyPage> {
  const where = {
    organizationId,
    status: { in: ["OPEN", "SETTLED"] },
    kitchenStatus: "READY"
  } satisfies Prisma.OrderWhereInput

  const totalCount = await prisma.order.count({ where })
  const pageCount = Math.max(1, Math.ceil(totalCount / kitchenReadyPageSize))
  const page = Math.min(Math.max(1, requestedPage), pageCount)
  const orders = await prisma.order.findMany({
    where,
    orderBy: [{ readyAt: "desc" }, { number: "desc" }],
    skip: (page - 1) * kitchenReadyPageSize,
    take: kitchenReadyPageSize,
    select: ticketSelect
  })

  return {
    serverTime: new Date().toISOString(),
    orders: orders.map(toTicket),
    totalCount,
    page,
    pageSize: kitchenReadyPageSize
  }
}

export async function getPendingOrders(
  organizationId: string
): Promise<PendingOrdersData> {
  const orders = await prisma.order.findMany({
    where: { organizationId, status: "OPEN" },
    orderBy: [{ submittedAt: "asc" }, { number: "asc" }],
    take: maxActiveOrders,
    select: { ...ticketSelect, currency: true, total: true }
  })

  return {
    serverTime: new Date().toISOString(),
    orders: orders.map(order => ({
      ...toTicket(order),
      currency: order.currency as Currency,
      total: order.total
    }))
  }
}

export async function getOpenOrderCount(organizationId: string) {
  if (!organizationId) return 0

  return prisma.order.count({ where: { organizationId, status: "OPEN" } })
}

export async function cancelLinkedKitchenOrder(
  tx: Prisma.TransactionClient,
  {
    organizationId,
    saleId,
    userId,
    reason,
    cancelledAt
  }: {
    organizationId: string
    saleId: string
    userId: string
    reason: string
    cancelledAt: Date
  }
) {
  const order = await tx.order.findFirst({
    where: { organizationId, saleId, status: { not: "CANCELLED" } },
    select: { id: true, kitchenStatus: true }
  })

  if (!order) return

  await tx.order.update({
    where: { id: order.id },
    data: {
      status: "CANCELLED",
      cancelledAt,
      cancelReason: reason,
      cancelledByUserId: userId,
      // Delivered orders need no kitchen alert.
      cancellationAcknowledgedAt:
        order.kitchenStatus === "READY" ? cancelledAt : null
    }
  })
}
