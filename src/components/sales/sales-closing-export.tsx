"use client"

import { Download } from "lucide-react"
import Papa from "papaparse"

import { Button } from "@/components/ui/button"
import { salesOrderTypeLabels, type SalesClosingData } from "@/lib/types/sales"
import { cn } from "@/lib/utils"

type ClosingCsvRow = {
  section: string
  label: string
  orderType: string
  quantity: number | ""
  orders: number | ""
  revenue: number | ""
  currency: string
}

function buildRows(data: SalesClosingData): ClosingCsvRow[] {
  const rows: ClosingCsvRow[] = [
    {
      section: "summary",
      label: "Ingresos del día",
      orderType: "",
      quantity: "",
      orders: "",
      revenue: data.todayRevenue,
      currency: data.currency
    },
    {
      section: "summary",
      label: "Órdenes del día",
      orderType: "",
      quantity: "",
      orders: data.todayOrders,
      revenue: "",
      currency: data.currency
    },
    ...data.bestSellers.map<ClosingCsvRow>(item => ({
      section: "best_sellers",
      label: item.productName,
      orderType: "",
      quantity: item.quantity,
      orders: "",
      revenue: item.revenue,
      currency: data.currency
    })),
    ...data.revenueByOrderType.map<ClosingCsvRow>(item => ({
      section: "order_type",
      label: salesOrderTypeLabels[item.orderType],
      orderType: item.orderType,
      quantity: "",
      orders: item.orders,
      revenue: item.revenue,
      currency: data.currency
    }))
  ]

  return rows
}

function downloadCsv(rows: ClosingCsvRow[], fileDateValue: string) {
  const csv = Papa.unparse(rows)
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
