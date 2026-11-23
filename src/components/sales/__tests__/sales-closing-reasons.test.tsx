import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { SalesClosingReport } from "@/components/sales/sales-closing"
import type { SalesClosingData } from "@/lib/types/sales"

vi.mock("@/lib/utils", async () => ({
  cn: (await import("cn")).cn
}))
vi.mock("@/components/sales/sales-closing-collections-pie-chart", () => ({
  SalesClosingCollectionsPieChart: () => null
}))
vi.mock("@/components/sales/sales-closing-hourly-chart", () => ({
  SalesClosingHourlyChart: () => null
}))

describe("SalesClosingReport void reasons", () => {
  it("displays stored labels, free text, enum keys, and missing reasons", () => {
    const data: SalesClosingData = {
      selectedDateValue: "2026-10-30",
      previousDateValue: "2026-10-29",
      currency: "MXN",
      todayRevenue: 0,
      todayOrders: 0,
      todayAverageTicket: 0,
      todaySales: 0,
      todayCollected: 0,
      todayPaidAtSale: 0,
      todayCreditGenerated: 0,
      todayReceivableCollection: 0,
      collectionBreakdown: [],
      collectionChart: [],
      hasCreditHistory: false,
      voidedSales: 4,
      voidedAmount: 40,
      voidedByReason: [
        { reason: "Productos incorrectos", sales: 1, amount: 10 },
        { reason: "Cliente se fue", sales: 1, amount: 10 },
        { reason: "TEST_SALE", sales: 1, amount: 10 },
        { reason: null, sales: 1, amount: 10 }
      ],
      topProduct: null,
      previous: {
        revenue: 0,
        orders: 0,
        averageTicket: 0,
        sales: 0,
        collected: 0,
        paidAtSale: 0,
        creditGenerated: 0,
        receivableCollection: 0
      },
      bestSellers: [],
      revenueByOrderType: [],
      hourly: [],
      recentSales: []
    }

    const html = renderToStaticMarkup(<SalesClosingReport data={data} />)
    expect(html).toContain("Productos incorrectos")
    expect(html).toContain("Cliente se fue")
    expect(html).toContain("Venta de prueba")
    expect(html.match(/Sin motivo/g)).toHaveLength(1)
  })
})
