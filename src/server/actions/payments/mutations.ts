"use server"

import { updateTag } from "next/cache"

import { MISSING_ORGANIZATION_REASON } from "@/server/actions/tenant-guards"
import { isProMember } from "@/server/actions/user/queries"
import {
  allocatePaymentFIFO,
  calculateBalanceMinor,
  currencyToMinorUnits,
  decimalToMinorUnits
} from "@/lib/payments"
import prisma from "@/lib/prisma"
import { authMemberActionClient } from "@/lib/safe-actions"
import {
  isPaymentMethodAccepted,
  registerCustomerPaymentSchema,
  voidPaymentSchema
} from "@/lib/types/payments"

function invalidatePaymentTags(
  organizationId: string,
  customerId?: string,
  saleIds: string[] = []
) {
  updateTag(`sales-${organizationId}`)
  updateTag(`customers-${organizationId}`)
  updateTag(`receivables-${organizationId}`)

  if (customerId) updateTag(`customer-${customerId}`)
  for (const saleId of saleIds) updateTag(`sale-${saleId}`)
}

export const registerCustomerPayment = authMemberActionClient
  .inputSchema(registerCustomerPaymentSchema)
  .action(async ({ parsedInput, ctx: { member } }) => {
    const organizationId = member.organizationId

    if (!organizationId) {
      return { failure: { reason: MISSING_ORGANIZATION_REASON } }
    }

    if (!(await isProMember())) {
      return {
        failure: {
          reason: "Registrar abonos requiere el plan Pro"
        }
      }
    }

    const amountMinor = decimalToMinorUnits(parsedInput.amount)

    const result = await prisma.$transaction(async tx => {
      const organization = await tx.organization.findUnique({
        where: { id: organizationId },
        select: {
          acceptsCash: true,
          acceptsCard: true,
          acceptsTransfer: true,
          acceptsCodi: true,
          acceptsVoucher: true
        }
      })

      if (!organization)
        return { failure: "Organización no encontrada" as const }

      if (!isPaymentMethodAccepted(organization, parsedInput.method)) {
        return {
          failure: "El método de pago no está habilitado" as const
        }
      }

      const customer = await tx.customer.findFirst({
        where: {
          id: parsedInput.customerId,
          organizationId
        },
        select: { id: true }
      })

      if (!customer) return { failure: "Cliente no encontrado" as const }

      const sales = await tx.sale.findMany({
        where: {
          organizationId,
          customerId: customer.id,
          status: "COMPLETED",
          currency: parsedInput.currency
        },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          createdAt: true,
          total: true,
          paymentAllocations: {
            select: {
              amountMinor: true,
              payment: {
                select: { status: true }
              }
            }
          }
        }
      })

      const openSales = sales.map(sale => {
        const paidMinor = sale.paymentAllocations.reduce(
          (total, allocation) =>
            allocation.payment.status === "ACTIVE"
              ? total + allocation.amountMinor
              : total,
          0
        )

        return {
          id: sale.id,
          createdAt: sale.createdAt,
          balanceMinor: calculateBalanceMinor(
            currencyToMinorUnits(sale.total),
            paidMinor
          )
        }
      })
      const allocations = allocatePaymentFIFO(openSales, amountMinor)

      if (allocations.length === 0) {
        return { failure: "El cliente no tiene saldo pendiente" as const }
      }

      const payment = await tx.payment.create({
        data: {
          organizationId,
          customerId: customer.id,
          currency: parsedInput.currency,
          amountMinor,
          method: parsedInput.method,
          origin: "RECEIVABLE",
          reference: parsedInput.reference || null,
          notes: parsedInput.notes || null,
          createdByUserId: member.user.id,
          allocations: {
            create: allocations
          }
        },
        select: {
          id: true,
          allocations: { select: { saleId: true } }
        }
      })

      return { success: payment }
    })

    if ("failure" in result) return { failure: { reason: result.failure } }

    invalidatePaymentTags(
      organizationId,
      parsedInput.customerId,
      result.success.allocations.map(allocation => allocation.saleId)
    )

    return {
      success: {
        id: result.success.id,
        allocations: result.success.allocations.length
      }
    }
  })

export const voidPayment = authMemberActionClient
  .inputSchema(voidPaymentSchema)
  .action(async ({ parsedInput, ctx: { member } }) => {
    const organizationId = member.organizationId

    if (!organizationId) {
      return { failure: { reason: MISSING_ORGANIZATION_REASON } }
    }

    const result = await prisma.$transaction(async tx => {
      const payment = await tx.payment.findFirst({
        where: {
          id: parsedInput.paymentId,
          organizationId,
          status: "ACTIVE"
        },
        select: {
          id: true,
          customerId: true,
          allocations: {
            select: {
              saleId: true,
              amountMinor: true,
              sale: {
                select: {
                  customerId: true,
                  total: true,
                  paymentAllocations: {
                    select: {
                      amountMinor: true,
                      payment: { select: { id: true, status: true } }
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!payment) return null

      const leavesAnonymousBalance = payment.allocations.some(allocation => {
        if (allocation.sale.customerId) return false

        const paidAfterVoid = allocation.sale.paymentAllocations.reduce(
          (total, saleAllocation) =>
            saleAllocation.payment.status === "ACTIVE" &&
            saleAllocation.payment.id !== payment.id
              ? total + saleAllocation.amountMinor
              : total,
          0
        )

        return (
          calculateBalanceMinor(
            currencyToMinorUnits(allocation.sale.total),
            paidAfterVoid
          ) > 0
        )
      })

      if (leavesAnonymousBalance) {
        return { failure: "anonymous-balance" as const }
      }

      const update = await tx.payment.updateMany({
        where: {
          id: payment.id,
          organizationId,
          status: "ACTIVE"
        },
        data: {
          status: "VOID",
          voidedAt: new Date(),
          voidedByUserId: member.user.id,
          voidReason: parsedInput.reason
        }
      })

      if (update.count !== 1) return { failure: "already-voided" as const }

      return {
        success: {
          id: payment.id,
          customerId: payment.customerId,
          saleIds: payment.allocations.map(allocation => allocation.saleId)
        }
      }
    })

    if (!result) {
      return {
        failure: {
          reason:
            "El pago no existe, no pertenece a esta organización o ya fue anulado"
        }
      }
    }

    if ("failure" in result) {
      return {
        failure: {
          reason:
            result.failure === "anonymous-balance"
              ? "No puedes anular este pago sin asignar antes un cliente a la venta"
              : "El pago ya fue anulado"
        }
      }
    }

    invalidatePaymentTags(
      organizationId,
      result.success.customerId ?? undefined,
      result.success.saleIds
    )

    return { success: { id: result.success.id } }
  })
