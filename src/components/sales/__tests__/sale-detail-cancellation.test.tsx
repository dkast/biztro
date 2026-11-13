import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { SaleDetailView } from "@/components/sales/sale-detail"
import type { SaleDetail } from "@/lib/types/sales"

vi.mock("@/lib/utils", async () => ({
  cn: (await import("cn")).cn
}))
vi.mock("@/components/sales/sale-void-dialog", () => ({
  SaleVoidDialog: () => <button>Anular venta</button>,
  SaleCancellationRefresh: () => null
}))
vi.mock("@/components/payments/payment-void-dialog", () => ({
  PaymentVoidDialog: () => <button>Anular pago</button>
}))

const baseSale: SaleDetail = {
  id: "sale_12345678",
  status: "COMPLETED",
  orderType: "DINE_IN",
  currency: "MXN",
  total: 100,
  paidMinor: 10000,
  balanceMinor: 0,
  paymentStatus: "PAID",
  customer: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  completedAt: null,
  completedBy: null,
  voidedAt: null,
  voidedBy: null,
  voidReason: null,
  cancellationPending: false,
  cancellationReason: null,
  items: [],
  payments: [
    {
      id: "pay_1",
      createdAt: "2026-01-01T00:00:00.000Z",
      method: "CASH",
      origin: "SALE",
      amountMinor: 10000,
      allocatedMinor: 10000,
      reference: null,
      notes: null,
      status: "ACTIVE",
      createdBy: null,
      voidedAt: null,
      voidReason: null,
      allocationCount: 1
    }
  ]
}

describe("SaleDetailView cancellation", () => {
  it("shows void actions when not pending", () => {
    const html = renderToStaticMarkup(<SaleDetailView sale={baseSale} />)
    expect(html).toContain("Completada")
    expect(html).toContain("Anular venta")
    expect(html).toContain("Anular pago")
  })

  it("shows pending label and hides void actions", () => {
    const html = renderToStaticMarkup(
      <SaleDetailView
        sale={{
          ...baseSale,
          cancellationPending: true,
          cancellationReason: "Cliente se fue"
        }}
      />
    )
    expect(html).toContain("Cancelación pendiente")
    expect(html).toContain("Cliente se fue")
    expect(html).not.toContain(">Completada<")
    expect(html).not.toContain("Anular venta")
    expect(html).not.toContain("Anular pago")
  })

  it("shows final void status and reason once acknowledged", () => {
    const html = renderToStaticMarkup(
      <SaleDetailView
        sale={{
          ...baseSale,
          status: "VOID",
          cancellationPending: false,
          cancellationReason: "Cliente se fue",
          voidedAt: "2026-01-01T01:00:00.000Z",
          voidedBy: { id: "user_1", name: "Ana" },
          voidReason: "Pedido cancelado en cocina"
        }}
      />
    )
    expect(html).not.toContain("Cancelación pendiente")
    expect(html).not.toContain("Anular venta")
    expect(html).not.toContain("Anular pago")
    expect(html).toContain("Anulada")
    expect(html).toContain("Pedido cancelado en cocina")
    expect(html).toContain("Anulada por Ana")
  })
})
