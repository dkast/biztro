"use server"

import { cacheLife, cacheTag } from "next/cache"

import {
  calculateBalanceMinor,
  currencyToMinorUnits,
  getPaymentStatus
} from "@/lib/payments"
import prisma from "@/lib/prisma"
import type {
  CustomerOpenSale,
  CustomerOption,
  CustomerReceivablesDetail,
  ReceivableCurrencySummary,
  ReceivableCustomer
} from "@/lib/types/customers"

function getSalePaymentSummary(sale: {
  total: number
  paymentAllocations: Array<{
    amountMinor: number
    payment: { status: "ACTIVE" | "VOID" }
  }>
}) {
  const totalMinor = currencyToMinorUnits(sale.total)
  const paidMinor = sale.paymentAllocations.reduce(
    (total, allocation) =>
      allocation.payment.status === "ACTIVE"
        ? total + allocation.amountMinor
        : total,
    0
  )

  return {
    totalMinor,
    paidMinor,
    balanceMinor: calculateBalanceMinor(totalMinor, paidMinor),
    paymentStatus: getPaymentStatus(totalMinor, paidMinor)
  }
}

function toSummaries(
  sales: Array<{
    currency: "MXN" | "USD"
    total: number
    paymentAllocations: Array<{
      amountMinor: number
      payment: { status: "ACTIVE" | "VOID" }
    }>
  }>
) {
  const byCurrency = new Map<string, ReceivableCurrencySummary>()

  for (const sale of sales) {
    const summary = getSalePaymentSummary(sale)
    if (summary.balanceMinor === 0) continue

    const current = byCurrency.get(sale.currency) ?? {
      currency: sale.currency,
      balanceMinor: 0,
      openSales: 0
    }

    current.balanceMinor += summary.balanceMinor
    current.openSales += 1
    byCurrency.set(sale.currency, current)
  }

  return [...byCurrency.values()].sort((a, b) =>
    a.currency.localeCompare(b.currency)
  )
}

export async function getCustomerOptions(
  organizationId: string
): Promise<CustomerOption[]> {
  "use cache: private"
  cacheLife({ stale: 30 })
  cacheTag(`customers-${organizationId}`)

  if (!organizationId) return []

  return await prisma.customer.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      phone: true
    }
  })
}

export async function getReceivableCustomers(
  organizationId: string
): Promise<ReceivableCustomer[]> {
  "use cache: private"
  cacheLife({ stale: 30 })
  cacheTag(`receivables-${organizationId}`)

  if (!organizationId) return []

  const customers = await prisma.customer.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      sales: {
        where: { status: "COMPLETED" },
        orderBy: { createdAt: "asc" },
        select: {
          createdAt: true,
          currency: true,
          total: true,
          paymentAllocations: {
            select: {
              amountMinor: true,
              payment: { select: { status: true } }
            }
          }
        }
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true }
      }
    }
  })

  return customers
    .map(customer => {
      const summaries = toSummaries(customer.sales)
      const newestSale = customer.sales.at(-1)?.createdAt
      const lastPayment = customer.payments[0]?.createdAt

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        summaries,
        lastMovementAt: (lastPayment ?? newestSale ?? new Date(0)).toISOString()
      }
    })
    .filter(customer => customer.summaries.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "es"))
}

export async function getCustomerReceivablesDetail(
  organizationId: string,
  customerId: string
): Promise<CustomerReceivablesDetail | null> {
  "use cache: private"
  cacheLife({ stale: 30 })
  cacheTag(`receivables-${organizationId}`)
  cacheTag(`customer-${customerId}`)

  if (!organizationId || !customerId) return null

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, organizationId },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      notes: true,
      sales: {
        where: { status: "COMPLETED" },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          createdAt: true,
          currency: true,
          total: true,
          paymentAllocations: {
            select: {
              amountMinor: true,
              payment: { select: { status: true } }
            }
          }
        }
      },
      payments: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          currency: true,
          amountMinor: true,
          method: true,
          status: true,
          reference: true,
          notes: true,
          allocations: { select: { id: true } }
        }
      }
    }
  })

  if (!customer) return null

  const openSales: CustomerOpenSale[] = customer.sales.flatMap(sale => {
    const summary = getSalePaymentSummary(sale)
    if (summary.balanceMinor === 0) return []

    return [
      {
        id: sale.id,
        createdAt: sale.createdAt.toISOString(),
        currency: sale.currency,
        totalMinor: summary.totalMinor,
        paidMinor: summary.paidMinor,
        balanceMinor: summary.balanceMinor
      }
    ]
  })

  return {
    customer: {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      notes: customer.notes
    },
    openSales,
    summaries: toSummaries(customer.sales),
    payments: customer.payments.map(payment => ({
      id: payment.id,
      createdAt: payment.createdAt.toISOString(),
      currency: payment.currency,
      amountMinor: payment.amountMinor,
      method: payment.method,
      status: payment.status,
      reference: payment.reference,
      notes: payment.notes,
      allocationCount: payment.allocations.length
    }))
  }
}
