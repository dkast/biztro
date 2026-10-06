import Papa from "papaparse"
import { describe, expect, it } from "vitest"

import {
  isSalesTransactionExportOverLimit,
  salesTransactionExportLimit
} from "@/lib/sales-transactions"
import { serializeSalesTransactionsCsv } from "@/lib/sales-transactions-csv"
import type { SalesTransaction } from "@/lib/types/sales"

function createTransaction(
  overrides: Partial<SalesTransaction> = {}
): SalesTransaction {
  return {
    id: "sale-01",
    createdAt: "2026-10-05T12:00:00.000Z",
    customerName: "Café del Día",
    orderType: "DINE_IN",
    status: "COMPLETED",
    paymentStatus: "PARTIAL",
    paymentMethods: ["CARD", "CASH"],
    voidedPaymentMethods: ["CASH"],
    items: 3,
    total: 125.5,
    currency: "MXN",
    ...overrides
  }
}

describe("sales transaction CSV", () => {
  it("exports all rows with stable headers, exact fields, and UTF-8 BOM", () => {
    const transactions = Array.from({ length: 26 }, (_, index) =>
      createTransaction({ id: `sale-${index + 1}` })
    )
    const csv = serializeSalesTransactionsCsv(transactions)
    const parsed = Papa.parse<Record<string, string>>(csv.slice(1), {
      header: true,
      skipEmptyLines: true
    })

    expect(csv.startsWith("\uFEFF")).toBe(true)
    expect(parsed.errors).toEqual([])
    expect(parsed.data).toHaveLength(26)
    expect(parsed.meta.fields).toEqual([
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
    ])
    expect(parsed.data[0]).toMatchObject({
      "ID de venta": "sale-1",
      "Fecha y hora": "2026-10-05T12:00:00.000Z",
      Cliente: "Café del Día",
      "Métodos de pago": "Tarjeta; Efectivo (incluye pago anulado)",
      Artículos: "3",
      Total: "125.5",
      Moneda: "MXN"
    })
  })

  it("escapes CSV fields and protects spreadsheet formula prefixes", () => {
    const csv = serializeSalesTransactionsCsv([
      createTransaction({
        id: '=HYPERLINK("https://example.test")',
        customerName: "\n=1+1, Café"
      })
    ])
    const parsed = Papa.parse<Record<string, string>>(csv.slice(1), {
      header: true,
      skipEmptyLines: true
    })

    expect(parsed.errors).toEqual([])
    expect(parsed.data[0]?.["ID de venta"]).toBe(
      '\'=HYPERLINK("https://example.test")'
    )
    expect(parsed.data[0]?.Cliente).toBe("'\n=1+1, Café")
  })

  it("allows exactly 10,000 rows and rejects larger exports", () => {
    expect(isSalesTransactionExportOverLimit(salesTransactionExportLimit)).toBe(
      false
    )
    expect(
      isSalesTransactionExportOverLimit(salesTransactionExportLimit + 1)
    ).toBe(true)
  })
})
