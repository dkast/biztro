"use server"

import * as Sentry from "@sentry/nextjs"
import { refresh, updateTag } from "next/cache"

import { isProMember } from "@/server/actions/user/queries"
import {
  createOrderRecord,
  isUniqueConstraintError,
  recordSale,
  resolveCatalogItems,
  withOrderNumberRetry
} from "@/server/sales/record-sale"
import type { Currency } from "@/lib/currency"
import {
  checkSalePayments,
  getNextKitchenStatus,
  mergeCartItems,
  normalizeOptionalText
} from "@/lib/orders"
import prisma from "@/lib/prisma"
import { authMemberActionClient } from "@/lib/safe-actions"
import {
  acknowledgeOrderCancellationSchema,
  cancelOrderSchema,
  kitchenStatusLabels,
  kitchenTransitionSchema,
  restoreKitchenOrderSchema,
  settleOrderSchema,
  submitOrderSchema,
  type KitchenStatus
} from "@/lib/types/order"
import type { SalesOrderType } from "@/lib/types/sales"

const missingOrganization = {
  failure: { reason: "No se pudo obtener la organización actual" }
}

class SettlementError extends Error {}

async function describeTransitionConflict(
  organizationId: string,
  orderId: string,
  expected: KitchenStatus
) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, organizationId },
    select: { status: true, kitchenStatus: true }
  })

  if (!order) return { failure: { reason: "La orden no existe" } }
  if (order.status === "CANCELLED") {
    return { failure: { reason: "La orden fue cancelada" } }
  }
  // A repeated tap already reached the requested state.
  if (order.kitchenStatus === expected) {
    return { success: { orderId, kitchenStatus: expected } }
  }

  const current = kitchenStatusLabels[order.kitchenStatus as KitchenStatus]
  return {
    failure: {
      reason: `Otra pantalla ya cambió esta orden a ${current.toLowerCase()}`
    }
  }
}

export const submitOrder = authMemberActionClient
  .inputSchema(submitOrderSchema)
  .action(async ({ parsedInput, ctx: { member } }) => {
    const organizationId = member.organizationId
    if (!organizationId) return missingOrganization

    if (!(await isProMember())) {
      return { failure: { reason: "Enviar órdenes requiere el plan Pro" } }
    }

    const findDuplicate = async () => {
      const order = await prisma.order.findUnique({
        where: {
          organizationId_requestId: {
            organizationId,
            requestId: parsedInput.requestId
          }
        },
        select: { id: true, number: true }
      })

      return order ? { success: order } : null
    }

    const duplicate = await findDuplicate()
    if (duplicate) return duplicate

    const resolved = await resolveCatalogItems(
      prisma,
      organizationId,
      mergeCartItems(parsedInput.items)
    )

    if ("failure" in resolved) return { failure: { reason: resolved.failure } }

    let result
    try {
      result = await withOrderNumberRetry(() =>
        prisma.$transaction(async tx => {
          const organization = await tx.organization.findUnique({
            where: { id: organizationId },
            select: { paymentTiming: true }
          })

          if (organization?.paymentTiming !== "PAY_ON_DELIVERY") {
            return {
              failure:
                "Este negocio ahora cobra al ordenar. Recarga el punto de venta para cobrar la venta." as const
            }
          }

          const order = await createOrderRecord(tx, {
            organizationId,
            userId: member.user.id,
            paymentTiming: "PAY_ON_DELIVERY",
            orderType: parsedInput.orderType,
            currency: resolved.currency,
            total: resolved.total,
            items: resolved.items,
            label: normalizeOptionalText(parsedInput.label),
            notes: normalizeOptionalText(parsedInput.notes),
            requestId: parsedInput.requestId
          })

          return { success: { id: order.id, number: order.number } }
        })
      )
    } catch (error) {
      if (isUniqueConstraintError(error, "requestId")) {
        const existing = await findDuplicate()
        if (existing) return existing
      }
      throw error
    }

    if ("failure" in result) return { failure: { reason: result.failure } }

    updateTag(`orders-${organizationId}`)

    return result
  })

export const advanceKitchenOrder = authMemberActionClient
  .inputSchema(kitchenTransitionSchema)
  .action(async ({ parsedInput, ctx: { member } }) => {
    const organizationId = member.organizationId
    if (!organizationId) return missingOrganization

    const next = getNextKitchenStatus(parsedInput.from)
    if (!next) return { failure: { reason: "La orden ya está lista" } }

    const now = new Date()
    const update = await prisma.order.updateMany({
      where: {
        id: parsedInput.orderId,
        organizationId,
        kitchenStatus: parsedInput.from,
        status: { in: ["OPEN", "SETTLED"] }
      },
      data: {
        kitchenStatus: next,
        ...(next === "PREPARING" ? { preparingAt: now } : { readyAt: now })
      }
    })

    if (update.count !== 1) {
      return describeTransitionConflict(
        organizationId,
        parsedInput.orderId,
        next
      )
    }

    updateTag(`orders-${organizationId}`)
    refresh()
    return { success: { orderId: parsedInput.orderId, kitchenStatus: next } }
  })

export const restoreKitchenOrder = authMemberActionClient
  .inputSchema(restoreKitchenOrderSchema)
  .action(async ({ parsedInput, ctx: { member } }) => {
    const organizationId = member.organizationId
    if (!organizationId) return missingOrganization

    const update = await prisma.order.updateMany({
      where: {
        id: parsedInput.orderId,
        organizationId,
        kitchenStatus: "READY",
        status: { in: ["OPEN", "SETTLED"] }
      },
      data: { kitchenStatus: "PREPARING", readyAt: null }
    })

    if (update.count !== 1) {
      return describeTransitionConflict(
        organizationId,
        parsedInput.orderId,
        "PREPARING"
      )
    }

    updateTag(`orders-${organizationId}`)
    refresh()
    return {
      success: {
        orderId: parsedInput.orderId,
        kitchenStatus: "PREPARING" as const
      }
    }
  })

export const acknowledgeOrderCancellation = authMemberActionClient
  .inputSchema(acknowledgeOrderCancellationSchema)
  .action(async ({ parsedInput, ctx: { member } }) => {
    const organizationId = member.organizationId
    if (!organizationId) return missingOrganization

    await prisma.order.updateMany({
      where: {
        id: parsedInput.orderId,
        organizationId,
        status: "CANCELLED",
        cancellationAcknowledgedAt: null
      },
      data: { cancellationAcknowledgedAt: new Date() }
    })

    refresh()
    return { success: { orderId: parsedInput.orderId } }
  })

export const cancelOrder = authMemberActionClient
  .inputSchema(cancelOrderSchema)
  .action(async ({ parsedInput, ctx: { member } }) => {
    const organizationId = member.organizationId
    if (!organizationId) return missingOrganization

    const result = await prisma.$transaction(async tx => {
      const order = await tx.order.findFirst({
        where: { id: parsedInput.orderId, organizationId },
        select: { status: true, kitchenStatus: true }
      })

      if (!order) return { failure: "La orden no existe" }
      if (order.status === "CANCELLED") {
        return { failure: "La orden ya fue cancelada" }
      }
      if (order.status === "SETTLED") {
        return {
          failure:
            "La orden ya fue cobrada. Anula la venta desde Transacciones si necesitas revertirla."
        }
      }

      const cancelledAt = new Date()
      const update = await tx.order.updateMany({
        where: { id: parsedInput.orderId, organizationId, status: "OPEN" },
        data: {
          status: "CANCELLED",
          cancelledAt,
          cancelReason: parsedInput.reason,
          cancelledByUserId: member.user.id,
          // Delivered orders need no kitchen alert.
          cancellationAcknowledgedAt:
            order.kitchenStatus === "READY" ? cancelledAt : null
        }
      })

      return update.count === 1
        ? { success: true as const }
        : { failure: "La orden cambió mientras se cancelaba" }
    })

    if ("failure" in result) return { failure: { reason: result.failure } }

    updateTag(`orders-${organizationId}`)
    refresh()
    return { success: { orderId: parsedInput.orderId } }
  })

export const settleOrder = authMemberActionClient
  .inputSchema(settleOrderSchema)
  .action(async ({ parsedInput, ctx: { member } }) => {
    const organizationId = member.organizationId
    if (!organizationId) return missingOrganization

    const order = await prisma.order.findFirst({
      where: { id: parsedInput.orderId, organizationId },
      select: {
        id: true,
        number: true,
        status: true,
        orderType: true,
        currency: true,
        total: true,
        items: {
          orderBy: { createdAt: "asc" },
          select: {
            menuItemId: true,
            variantId: true,
            productName: true,
            variantName: true,
            unitPrice: true,
            quantity: true,
            lineTotal: true
          }
        }
      }
    })

    if (!order) return { failure: { reason: "La orden no existe" } }
    if (order.status === "SETTLED") {
      return { failure: { reason: "Esta orden ya fue cobrada" } }
    }
    if (order.status === "CANCELLED") {
      return { failure: { reason: "Esta orden fue cancelada" } }
    }

    const paymentCheck = checkSalePayments({
      total: order.total,
      payments: parsedInput.payments,
      customerId: parsedInput.customerId,
      acceptsCredit: parsedInput.acceptsCredit
    })

    if ("failure" in paymentCheck) {
      return { failure: { reason: paymentCheck.failure } }
    }

    let sale
    try {
      sale = await prisma.$transaction(async tx => {
        const claim = await tx.order.updateMany({
          where: {
            id: order.id,
            organizationId,
            status: "OPEN",
            saleId: null
          },
          data: { status: "SETTLED", settledAt: new Date() }
        })

        if (claim.count !== 1) {
          throw new SettlementError(
            "La orden cambió en otra pantalla. Revisa Por cobrar."
          )
        }

        const created = await recordSale(tx, {
          organizationId,
          userId: member.user.id,
          orderType: order.orderType as SalesOrderType,
          currency: order.currency as Currency,
          total: order.total,
          items: order.items,
          customerId: parsedInput.customerId,
          payments: parsedInput.payments,
          balanceMinor: paymentCheck.balanceMinor
        })

        // Throwing rolls back the claim so the order stays collectible.
        if ("failure" in created) throw new SettlementError(created.failure)

        await tx.order.update({
          where: { id: order.id },
          data: { saleId: created.success.id }
        })

        return created.success
      })
    } catch (error) {
      if (error instanceof SettlementError) {
        return { failure: { reason: error.message } }
      }
      Sentry.captureException(error)
      throw error
    }

    updateTag(`sales-${organizationId}`)
    updateTag(`receivables-${organizationId}`)
    updateTag(`customers-${organizationId}`)
    updateTag(`orders-${organizationId}`)
    if (parsedInput.customerId) updateTag(`customer-${parsedInput.customerId}`)
    refresh()

    return {
      success: {
        id: sale.id,
        orderType: sale.orderType,
        total: sale.total,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        orderNumber: order.number
      }
    }
  })
