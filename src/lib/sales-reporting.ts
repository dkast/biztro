import { currencyToMinorUnits } from "@/lib/payments"
import type { PaymentMethod, PaymentOrigin } from "@/lib/types/payments"
import type {
  SalesCollectionBreakdown,
  SalesFinancialMetrics
} from "@/lib/types/sales"

export type FinancialSaleRow = {
  createdAt: Date
  total: number
  paymentAllocations: Array<{
    amountMinor: number
    payment: {
      status: "ACTIVE" | "VOID"
      origin: PaymentOrigin
    }
  }>
}

export type CollectionPaymentRow = {
  createdAt: Date
  amountMinor: number
  method: PaymentMethod | "LEGACY"
  origin: PaymentOrigin
  status: "ACTIVE" | "VOID"
}

export function minorToMoney(amountMinor: number) {
  return Math.round((amountMinor / 100 + Number.EPSILON) * 100) / 100
}

export function getFinancialMetrics({
  sales,
  payments
}: {
  sales: readonly FinancialSaleRow[]
  payments: readonly CollectionPaymentRow[]
}): SalesFinancialMetrics {
  let salesMinor = 0
  let paidAtSaleMinor = 0
  let creditGeneratedMinor = 0

  for (const sale of sales) {
    const totalMinor = currencyToMinorUnits(sale.total)
    const salePaidMinor = sale.paymentAllocations.reduce(
      (total, allocation) =>
        allocation.payment.status === "ACTIVE" &&
        allocation.payment.origin === "SALE"
          ? total + allocation.amountMinor
          : total,
      0
    )

    salesMinor += totalMinor
    paidAtSaleMinor += Math.min(totalMinor, salePaidMinor)
    creditGeneratedMinor += Math.max(0, totalMinor - salePaidMinor)
  }

  let collectedMinor = 0
  let receivableCollectionMinor = 0

  for (const payment of payments) {
    if (payment.status === "VOID") continue

    collectedMinor += payment.amountMinor
    if (payment.origin === "RECEIVABLE") {
      receivableCollectionMinor += payment.amountMinor
    }
  }

  return {
    sales: minorToMoney(salesMinor),
    collected: minorToMoney(collectedMinor),
    paidAtSale: minorToMoney(paidAtSaleMinor),
    creditGenerated: minorToMoney(creditGeneratedMinor),
    receivableCollection: minorToMoney(receivableCollectionMinor)
  }
}

export function getCollectionBreakdown(
  payments: readonly CollectionPaymentRow[]
): SalesCollectionBreakdown[] {
  const breakdown = new Map<
    `${PaymentMethod | "LEGACY"}:${PaymentOrigin}`,
    SalesCollectionBreakdown
  >()

  for (const payment of payments) {
    if (payment.status === "VOID") continue

    const key = `${payment.method}:${payment.origin}` as const
    const current = breakdown.get(key) ?? {
      method: payment.method,
      origin: payment.origin,
      amount: 0,
      amountMinor: 0,
      payments: 0
    }

    current.amountMinor += payment.amountMinor
    current.payments += 1
    current.amount = minorToMoney(current.amountMinor)
    breakdown.set(key, current)
  }

  return [...breakdown.values()].sort(
    (left, right) =>
      left.origin.localeCompare(right.origin) ||
      left.method.localeCompare(right.method)
  )
}
