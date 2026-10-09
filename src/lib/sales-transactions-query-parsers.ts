"use client"

import {
  debounce,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum
} from "nuqs"

import {
  defaultSalesTransactionFilters,
  salesTransactionDateRangeValues,
  salesTransactionFilterValues
} from "@/lib/sales-transactions"

export const salesTransactionsQueryParsers = {
  range: parseAsStringEnum([...salesTransactionDateRangeValues]).withDefault(
    defaultSalesTransactionFilters.range
  ),
  from: parseAsString.withDefault(defaultSalesTransactionFilters.from),
  to: parseAsString.withDefault(defaultSalesTransactionFilters.to),
  status: parseAsStringEnum([
    ...salesTransactionFilterValues.status
  ]).withDefault(defaultSalesTransactionFilters.status),
  orderType: parseAsStringEnum([
    ...salesTransactionFilterValues.orderType
  ]).withDefault(defaultSalesTransactionFilters.orderType),
  paymentStatus: parseAsStringEnum([
    ...salesTransactionFilterValues.paymentStatus
  ]).withDefault(defaultSalesTransactionFilters.paymentStatus),
  paymentMethod: parseAsStringEnum([
    ...salesTransactionFilterValues.paymentMethod
  ]).withDefault(defaultSalesTransactionFilters.paymentMethod),
  q: parseAsString
    .withDefault(defaultSalesTransactionFilters.q)
    .withOptions({ limitUrlUpdates: debounce(300) }),
  page: parseAsInteger.withDefault(defaultSalesTransactionFilters.page)
}
