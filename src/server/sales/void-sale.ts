import "server-only"

import type { Prisma } from "@/generated/prisma-client/client"

import { cancelLinkedKitchenOrder } from "@/server/sales/orders"

export async function voidSaleRecord(
  tx: Prisma.TransactionClient,
  {
    organizationId,
    saleId,
    userId,
    reason,
    voidedAt,
    waitForKitchen = false
  }: {
    organizationId: string
    saleId: string
    userId: string
    reason: string
    voidedAt: Date
    waitForKitchen?: boolean
  }
) {
  const sale = await tx.sale.findFirst({
    where: { id: saleId, organizationId, status: "COMPLETED" },
    select: { id: true }
  })
  if (!sale) return { blocked: false, count: 0, cancellationPending: false }

  const activePayments = await tx.payment.findMany({
    where: {
      organizationId,
      status: "ACTIVE",
      allocations: { some: { saleId } }
    },
    select: {
      id: true,
      allocations: { select: { saleId: true } }
    }
  })
  if (
    activePayments.some(payment =>
      payment.allocations.some(allocation => allocation.saleId !== saleId)
    )
  ) {
    return { blocked: true, count: 0, cancellationPending: false }
  }

  if (waitForKitchen) {
    const order = await tx.order.findFirst({
      where: { organizationId, saleId },
      select: { id: true, status: true, cancellationAcknowledgedAt: true }
    })
    if (order?.status === "CANCELLED") {
      return {
        blocked: false,
        count: 0,
        cancellationPending: !order.cancellationAcknowledgedAt
      }
    }
    if (order) {
      await cancelLinkedKitchenOrder(tx, {
        organizationId,
        saleId,
        userId,
        reason,
        cancelledAt: voidedAt
      })
      return { blocked: false, count: 1, cancellationPending: true }
    }
  }

  const update = await tx.sale.updateMany({
    where: { id: saleId, organizationId, status: "COMPLETED" },
    data: {
      status: "VOID",
      voidedAt,
      voidedByUserId: userId,
      voidReason: reason
    }
  })
  if (update.count === 1 && activePayments.length > 0) {
    await tx.payment.updateMany({
      where: {
        id: { in: activePayments.map(payment => payment.id) },
        organizationId,
        status: "ACTIVE"
      },
      data: {
        status: "VOID",
        voidedAt,
        voidedByUserId: userId,
        voidReason: reason
      }
    })
  }
  return { blocked: false, count: update.count, cancellationPending: false }
}
