export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID"

export type DecimalCurrencyInput = string | number

export type OpenSale = {
  id: string
  balanceMinor: number
  createdAt: Date | string
}

export type PaymentAllocation = {
  saleId: string
  amountMinor: number
}

const isInteger = (value: number) => Number.isInteger(value) && value >= 0

export function currencyToMinorUnits(input: DecimalCurrencyInput): number {
  const value = typeof input === "string" ? input.trim() : input

  if (
    (typeof value === "string" &&
      !/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value)) ||
    (typeof value === "number" && (!Number.isFinite(value) || value < 0))
  ) {
    throw new Error(
      "Currency amount must be a nonnegative number with no more than two decimal places"
    )
  }

  const numericValue = typeof value === "string" ? Number(value) : value
  if (numericValue < 0 || !Number.isFinite(numericValue)) {
    throw new Error(
      "Currency amount must be a nonnegative number with no more than two decimal places"
    )
  }

  const minorUnits = Math.round(numericValue * 100)
  if (
    !Number.isSafeInteger(minorUnits) ||
    Math.abs(numericValue * 100 - minorUnits) >
      Number.EPSILON * Math.max(1, Math.abs(numericValue * 100)) * 10
  ) {
    throw new Error(
      "Currency amount must be a nonnegative number with no more than two decimal places"
    )
  }

  return minorUnits
}

export function decimalToMinorUnits(input: DecimalCurrencyInput): number {
  const minorUnits = currencyToMinorUnits(input)
  if (minorUnits === 0) {
    throw new Error(
      "Currency amount must be a positive number with no more than two decimal places"
    )
  }

  return minorUnits
}

export function getPaymentStatus(
  totalMinor: number,
  paidMinor: number
): PaymentStatus {
  if (!isInteger(totalMinor)) {
    throw new Error(
      "Total amount must be a nonnegative integer number of minor units"
    )
  }
  if (!isInteger(paidMinor)) {
    throw new Error(
      "Paid amount must be a nonnegative integer number of minor units"
    )
  }

  if (totalMinor === 0 || paidMinor >= totalMinor) return "PAID"
  if (paidMinor === 0) return "PENDING"
  if (paidMinor < totalMinor) return "PARTIAL"
  return "PAID"
}

export function calculateBalanceMinor(
  totalMinor: number,
  paidMinor: number
): number {
  if (!isInteger(totalMinor) || !isInteger(paidMinor)) {
    throw new Error(
      "Amounts must be nonnegative integer numbers of minor units"
    )
  }

  return Math.max(0, totalMinor - paidMinor)
}

export function allocatePaymentFIFO(
  sales: readonly OpenSale[],
  paymentMinor: number
): PaymentAllocation[] {
  if (!isInteger(paymentMinor)) {
    throw new Error(
      "Payment amount must be a nonnegative integer number of minor units"
    )
  }

  const openSales = sales
    .map((sale, index) => ({ sale, index }))
    .filter(({ sale }) => {
      if (!isInteger(sale.balanceMinor)) {
        throw new Error(
          "Sale balances must be nonnegative integer numbers of minor units"
        )
      }
      return sale.balanceMinor > 0
    })
    .sort(
      (left, right) =>
        new Date(left.sale.createdAt).getTime() -
          new Date(right.sale.createdAt).getTime() || left.index - right.index
    )

  const totalBalanceMinor = openSales.reduce(
    (sum, { sale }) => sum + sale.balanceMinor,
    0
  )
  if (paymentMinor > totalBalanceMinor) {
    throw new Error("Payment amount cannot exceed the total open sales balance")
  }

  let remainingMinor = paymentMinor
  const allocations: PaymentAllocation[] = []

  for (const { sale } of openSales) {
    if (remainingMinor === 0) break

    const amountMinor = Math.min(remainingMinor, sale.balanceMinor)
    if (amountMinor > 0) allocations.push({ saleId: sale.id, amountMinor })
    remainingMinor -= amountMinor
  }

  return allocations
}

export const toMinorUnits = decimalToMinorUnits
export const derivePaymentStatus = getPaymentStatus
export const getBalanceMinor = calculateBalanceMinor
export const allocatePaymentFifo = allocatePaymentFIFO
