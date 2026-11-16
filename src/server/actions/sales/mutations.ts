"use server"

import { updateTag } from "next/cache"

import { isProMember } from "@/server/actions/user/queries"
import { publishOrderChange } from "@/server/orders/realtime"
import {
  createOrderRecord,
  isUniqueConstraintError,
  recordSale,
  resolveCatalogItems,
  withOrderNumberRetry
} from "@/server/sales/record-sale"
import { voidSaleRecord } from "@/server/sales/void-sale"
import {
  checkSalePayments,
  mergeCartItems,
  normalizeOptionalText
} from "@/lib/orders"
import prisma from "@/lib/prisma"
import { authMemberActionClient } from "@/lib/safe-actions"
import {
  completeSaleSchema,
  voidReasonLabels,
  voidSaleSchema
} from "@/lib/types/sales"

export const completeSale = authMemberActionClient
  .inputSchema(completeSaleSchema)
  .action(async ({ parsedInput, ctx: { member } }) => {
    const organizationId = member.organizationId

    if (!(await isProMember())) {
      return {
        failure: {
          reason: "Registrar ventas requiere el plan Pro"
        }
      }
    }

    if (!organizationId) {
      return {
        failure: {
          reason: "No se pudo obtener la organización actual"
        }
      }
    }

    const requestId = parsedInput.requestId ?? null
    const findDuplicate = async () => {
      if (!requestId) return null

      const order = await prisma.order.findUnique({
        where: { organizationId_requestId: { organizationId, requestId } },
        select: {
          number: true,
          sale: { select: { id: true, orderType: true, total: true } },
          items: { select: { quantity: true } }
        }
      })

      if (!order?.sale) return null

      return {
        success: {
          id: order.sale.id,
          orderType: order.sale.orderType,
          total: order.sale.total,
          itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
          orderNumber: order.number
        }
      }
    }

    const duplicate = await findDuplicate()
    if (duplicate) return duplicate

    const resolved = await resolveCatalogItems(
      prisma,
      organizationId,
      mergeCartItems(parsedInput.items)
    )

    if ("failure" in resolved) {
      return { failure: { reason: resolved.failure } }
    }

    const paymentCheck = checkSalePayments({
      total: resolved.total,
      payments: parsedInput.payments,
      customerId: parsedInput.customerId,
      acceptsCredit: parsedInput.acceptsCredit
    })

    if ("failure" in paymentCheck) {
      return { failure: { reason: paymentCheck.failure } }
    }

    const itemCount = resolved.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    )

    let saleResult
    try {
      saleResult = await withOrderNumberRetry(() =>
        prisma.$transaction(async tx => {
          const organization = await tx.organization.findUnique({
            where: { id: organizationId },
            select: { paymentTiming: true }
          })

          if (organization?.paymentTiming === "PAY_ON_DELIVERY") {
            return {
              failure:
                "Este negocio ahora cobra al entregar. Recarga el punto de venta para enviar la orden a cocina." as const
            }
          }

          const sale = await recordSale(tx, {
            organizationId,
            userId: member.user.id,
            orderType: parsedInput.orderType,
            currency: resolved.currency,
            total: resolved.total,
            items: resolved.items,
            customerId: parsedInput.customerId,
            payments: parsedInput.payments,
            balanceMinor: paymentCheck.balanceMinor
          })

          if ("failure" in sale) return { failure: sale.failure }

          const order = await createOrderRecord(tx, {
            organizationId,
            userId: member.user.id,
            paymentTiming: "PAY_FIRST",
            orderType: parsedInput.orderType,
            currency: resolved.currency,
            total: resolved.total,
            items: resolved.items,
            label: normalizeOptionalText(parsedInput.label),
            notes: normalizeOptionalText(parsedInput.notes),
            requestId,
            saleId: sale.success.id
          })

          return { success: { ...sale.success, orderNumber: order.number } }
        })
      )
    } catch (error) {
      if (isUniqueConstraintError(error, "requestId")) {
        const existing = await findDuplicate()
        if (existing) return existing
      }
      throw error
    }

    if ("failure" in saleResult) {
      return {
        failure: {
          reason: saleResult.failure
        }
      }
    }

    updateTag(`sales-${organizationId}`)
    updateTag(`receivables-${organizationId}`)
    updateTag(`customers-${organizationId}`)
    updateTag(`orders-${organizationId}`)
    if (parsedInput.customerId) updateTag(`customer-${parsedInput.customerId}`)
    await publishOrderChange(organizationId, "created")

    return {
      success: {
        id: saleResult.success.id,
        orderType: saleResult.success.orderType,
        total: saleResult.success.total,
        itemCount,
        orderNumber: saleResult.success.orderNumber
      }
    }
  })

export const voidSale = authMemberActionClient
  .inputSchema(voidSaleSchema)
  .action(async ({ parsedInput, ctx: { member } }) => {
    const organizationId = member.organizationId

    if (!organizationId) {
      return {
        failure: {
          reason: "No se pudo obtener la organización actual"
        }
      }
    }

    const voidReason =
      parsedInput.reason === "OTHER"
        ? parsedInput.reasonDetail!.trim()
        : voidReasonLabels[parsedInput.reason]

    const result = await prisma.$transaction(tx =>
      voidSaleRecord(tx, {
        organizationId,
        saleId: parsedInput.saleId,
        userId: member.user.id,
        reason: voidReason,
        voidedAt: new Date(),
        waitForKitchen: true
      })
    )

    if (result.blocked) {
      return {
        failure: {
          reason:
            "Anula primero los pagos activos compartidos con otras ventas antes de anularla"
        }
      }
    }

    if (result.count !== 1) {
      return {
        failure: {
          reason: result.cancellationPending
            ? "La cancelación ya está pendiente de confirmación de cocina"
            : "La venta no existe, no pertenece a esta organización o ya fue anulada"
        }
      }
    }

    updateTag(`sales-${organizationId}`)
    updateTag(`sale-${parsedInput.saleId}`)
    updateTag(`orders-${organizationId}`)
    updateTag(`receivables-${organizationId}`)
    await publishOrderChange(organizationId, "cancellation")

    return {
      success: {
        id: parsedInput.saleId,
        cancellationPending: result.cancellationPending
      }
    }
  })
