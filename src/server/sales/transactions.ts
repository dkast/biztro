import "server-only"

import { z } from "zod/v4"

import type { Currency } from "@/lib/currency"
import { currencyToMinorUnits, getPaymentStatus } from "@/lib/payments"
import prisma from "@/lib/prisma"
import type { SalesTransactionFilters } from "@/lib/sales-transactions"
import { buildSalesTransactionsSql } from "@/lib/sales-transactions-sql"
import {
  salesOrderTypeSchema,
  saleStatusSchema,
  salesTransactionPaymentMethodSchema,
  type SalesTransaction,
  type SalesTransactionsPage
} from "@/lib/types/sales"

type SqlNumber = number | bigint | string

type SalesTransactionSqlRow = {
  id: string | null
  created_at: string | Date | null
  customer_name: string | null
  order_type: string | null
  sale_status: string | null
  total: number | null
  currency: string | null
  paid_minor: SqlNumber | null
  item_count: SqlNumber | null
  payment_methods: string | null
  voided_payment_methods: string | null
  total_count: SqlNumber
}

function toSafeInteger(value: SqlNumber | null, field: string) {
  const parsed = Number(value ?? 0)
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid ${field} in sales transactions query`)
  }
  return parsed
}

function parsePaymentMethods(value: string | null) {
  if (!value) return []

  return [
    ...new Set(
      value
        .split(",")
        .map(method => salesTransactionPaymentMethodSchema.parse(method))
    )
  ]
}

function parseCreatedAt(value: string | Date | null) {
  if (!value) throw new Error("Missing sale creation date in query result")

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid sale creation date in query result")
  }

  return date.toISOString()
}

function mapTransaction(row: SalesTransactionSqlRow): SalesTransaction | null {
  if (row.id === null) return null

  if (row.total === null || row.currency === null) {
    throw new Error("Missing sale total or currency in query result")
  }

  const total = Math.round((row.total + Number.EPSILON) * 100) / 100
  const totalMinor = currencyToMinorUnits(total)
  const paidMinor = toSafeInteger(row.paid_minor, "paid amount")
  const orderType = salesOrderTypeSchema.parse(row.order_type)
  const status = saleStatusSchema.parse(row.sale_status)
  const currency: Currency = currencySchema.parse(row.currency)

  return {
    id: row.id,
    createdAt: parseCreatedAt(row.created_at),
    customerName: row.customer_name,
    orderType,
    status,
    paymentStatus: getPaymentStatus(totalMinor, paidMinor),
    paymentMethods: parsePaymentMethods(row.payment_methods),
    voidedPaymentMethods: parsePaymentMethods(row.voided_payment_methods),
    items: toSafeInteger(row.item_count, "item count"),
    total,
    currency
  }
}

const currencySchema = z.enum(["MXN", "USD"])

export async function getSalesTransactions({
  organizationId,
  filters,
  page = filters.page,
  pageSize = 25
}: {
  organizationId: string
  filters: SalesTransactionFilters
  page?: number
  pageSize?: number
}): Promise<SalesTransactionsPage> {
  if (!organizationId) throw new Error("Organization is required")
  if (!Number.isSafeInteger(page) || page < 1) {
    throw new Error("Page must be a positive safe integer")
  }
  if (!Number.isSafeInteger(pageSize) || pageSize < 1) {
    throw new Error("Page size must be a positive safe integer")
  }

  const sql = buildSalesTransactionsSql({
    organizationId,
    filters,
    page,
    pageSize
  })
  const rows = await prisma.$queryRaw<SalesTransactionSqlRow[]>(sql)
  const totalCount = toSafeInteger(rows[0]?.total_count ?? 0, "total count")

  return {
    transactions: rows
      .map(mapTransaction)
      .filter(
        (transaction): transaction is SalesTransaction => transaction !== null
      ),
    totalCount,
    page,
    pageSize
  }
}
