"use client"

import { Download } from "lucide-react"
import Papa from "papaparse"

import { Button } from "@/components/ui/button"
import { salesOrderTypeLabels, type SalesClosingData } from "@/lib/types/sales"
import { cn } from "@/lib/utils"

type ClosingCsvRow = {
  section: string
  label: string
  detail: string
  orderType: string
  quantity: number | ""
  orders: number | ""
  revenue: number | ""
  currency: string
  hour: string
  previousOrders: number | ""
  previousRevenue: number | ""
  createdAt: string
}

const closingCsvFields: (keyof ClosingCsvRow)[] = [
  "section",
  "label",
  "detail",
  "orderType",
  "quantity",
  "orders",
  "revenue",
  "currency",
  "hour",
  "previousOrders",
  "previousRevenue",
  "createdAt"
]

function buildRows(data: SalesClosingData): ClosingCsvRow[] {
  const rows: ClosingCsvRow[] = [
    {
      section: "summary",
      label: "Ingresos del día",
      detail: "",
      orderType: "",
      quantity: "",
      orders: "",
      revenue: data.todayRevenue,
      currency: data.currency,
      hour: "",
      previousOrders: "",
      previousRevenue: "",
      createdAt: ""
    },
    {
      section: "summary",
      label: "Órdenes del día",
      detail: "",
      orderType: "",
      quantity: "",
      orders: data.todayOrders,
      revenue: "",
      currency: data.currency,
      hour: "",
      previousOrders: "",
      previousRevenue: "",
      createdAt: ""
    },
    {
      section: "summary",
      label: "Ticket promedio",
      detail: "",
      orderType: "",
      quantity: "",
      orders: "",
      revenue: data.todayAverageTicket,
      currency: data.currency,
      hour: "",
      previousOrders: "",
      previousRevenue: "",
      createdAt: ""
    },
    {
      section: "summary",
      label: "Producto más vendido",
      detail: data.topProduct?.productName ?? "",
      orderType: "",
      quantity: data.topProduct?.quantity ?? "",
      orders: "",
      revenue: data.topProduct?.revenue ?? "",
      currency: data.currency,
      hour: "",
      previousOrders: "",
      previousRevenue: "",
      createdAt: ""
    },
    {
      section: "previous_day",
      label: "Ingresos del día anterior",
      detail: data.previousDateValue,
      orderType: "",
      quantity: "",
      orders: "",
      revenue: data.previous.revenue,
      currency: data.currency,
      hour: "",
      previousOrders: "",
      previousRevenue: "",
      createdAt: ""
    },
    {
      section: "previous_day",
      label: "Órdenes del día anterior",
      detail: data.previousDateValue,
      orderType: "",
      quantity: "",
      orders: data.previous.orders,
      revenue: "",
      currency: data.currency,
      hour: "",
      previousOrders: "",
      previousRevenue: "",
      createdAt: ""
    },
    {
      section: "previous_day",
      label: "Ticket promedio del día anterior",
      detail: data.previousDateValue,
      orderType: "",
      quantity: "",
      orders: "",
      revenue: data.previous.averageTicket,
      currency: data.currency,
      hour: "",
      previousOrders: "",
      previousRevenue: "",
      createdAt: ""
    },
    ...data.hourly.map<ClosingCsvRow>(bucket => ({
      section: "hourly",
      label: bucket.label,
      detail: "",
      orderType: "",
      quantity: "",
      orders: bucket.todayOrders,
      revenue: bucket.todayRevenue,
      currency: data.currency,
      hour: String(bucket.hour),
      previousOrders: bucket.previousOrders,
      previousRevenue: bucket.previousRevenue,
      createdAt: ""
    })),
    ...data.bestSellers.map<ClosingCsvRow>(item => ({
      section: "best_sellers",
      label: item.productName,
      detail: "",
      orderType: "",
      quantity: item.quantity,
      orders: "",
      revenue: item.revenue,
      currency: data.currency,
      hour: "",
      previousOrders: "",
      previousRevenue: "",
      createdAt: ""
    })),
    ...data.revenueByOrderType.map<ClosingCsvRow>(item => ({
      section: "order_type",
      label: salesOrderTypeLabels[item.orderType],
      detail: "",
      orderType: item.orderType,
      quantity: "",
      orders: item.orders,
      revenue: item.revenue,
      currency: data.currency,
      hour: "",
      previousOrders: "",
      previousRevenue: "",
      createdAt: ""
    })),
    ...data.recentSales.map<ClosingCsvRow>(sale => ({
      section: "recent_sales",
      label: salesOrderTypeLabels[sale.orderType],
      detail: "",
      orderType: sale.orderType,
      quantity: sale.items,
      orders: "",
      revenue: sale.total,
      currency: data.currency,
      hour: "",
      previousOrders: "",
      previousRevenue: "",
      createdAt: sale.createdAt
    }))
  ]

  return rows
}

function downloadCsv(rows: ClosingCsvRow[], fileDateValue: string) {
  const csv = Papa.unparse(rows, { columns: closingCsvFields })
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `cierre-ventas-${fileDateValue}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function SalesClosingExportButton({
  className,
  data
}: {
  className?: string
  data: SalesClosingData
}) {
  const fileDateValue = data.selectedDateValue

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("w-full sm:w-auto", className)}
      onClick={() => downloadCsv(buildRows(data), fileDateValue)}
    >
      <Download data-icon="inline-start" />
      Exportar CSV
    </Button>
  )
}
