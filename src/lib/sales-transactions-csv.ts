import Papa from "papaparse"

import { paymentMethodLabels, paymentStatusLabels } from "@/lib/types/payments"
import {
  salesOrderTypeLabels,
  saleStatusLabels,
  type SalesTransaction,
  type SalesTransactionPaymentMethod
} from "@/lib/types/sales"

const salesTransactionsCsvHeaders = [
  "ID de venta",
  "Fecha y hora",
  "Cliente",
  "Tipo de orden",
  "Estado de venta",
  "Estado de pago",
  "Métodos de pago",
  "Artículos",
  "Total",
  "Moneda"
]

const formulaPrefixPattern = /^[\u0000-\u0020]*[=+\-@]/

function protectSpreadsheetText(value: string) {
  return formulaPrefixPattern.test(value) ? `'${value}` : value
}

function getPaymentMethodLabel(
  method: SalesTransactionPaymentMethod,
  isVoided: boolean
) {
  const label =
    method === "LEGACY" ? "Pago histórico" : paymentMethodLabels[method]
  return isVoided ? `${label} (incluye pago anulado)` : label
}

function getPaymentMethodsLabel(transaction: SalesTransaction) {
  return transaction.paymentMethods
    .map(method =>
      getPaymentMethodLabel(
        method,
        transaction.voidedPaymentMethods.includes(method)
      )
    )
    .join("; ")
}

export function serializeSalesTransactionsCsv(
  transactions: SalesTransaction[]
) {
  const rows = transactions.map(transaction => [
    protectSpreadsheetText(transaction.id),
    transaction.createdAt,
    protectSpreadsheetText(transaction.customerName ?? "Sin cliente"),
    salesOrderTypeLabels[transaction.orderType],
    saleStatusLabels[transaction.status],
    paymentStatusLabels[transaction.paymentStatus],
    protectSpreadsheetText(getPaymentMethodsLabel(transaction)),
    transaction.items,
    transaction.total,
    transaction.currency
  ])

  return `\uFEFF${Papa.unparse({
    fields: salesTransactionsCsvHeaders,
    data: rows
  })}`
}
