"use client"

import { ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatPrice, type Currency } from "@/lib/currency"
import {
  salesOrderTypeBadgeVariants,
  salesOrderTypeLabels,
  saleStatusLabels,
  type SalesRecentSale
} from "@/lib/types/sales"

function formatDateTime(value: string, variant: "dashboard" | "closing") {
  return new Intl.DateTimeFormat("es-MX", {
    ...(variant === "dashboard"
      ? { dateStyle: "medium" as const, timeStyle: "short" as const }
      : { timeStyle: "short" as const })
  }).format(new Date(value))
}

export function SalesRecentSaleRow({
  sale,
  currency,
  variant
}: {
  sale: SalesRecentSale
  currency: Currency
  variant: "dashboard" | "closing"
}) {
  const router = useRouter()
  const detailHref = `/dashboard/sales/order/${sale.id}`
  const cellClassName = variant === "closing" ? "px-3 py-2.5" : undefined

  const openSale = () => router.push(detailHref)

  return (
    <TableRow
      className="group focus-visible:bg-muted cursor-pointer
        focus-visible:outline-none"
      role="link"
      tabIndex={0}
      aria-label={`Ver detalle de venta de ${formatDateTime(sale.createdAt, variant)}`}
      onClick={openSale}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          openSale()
        }
      }}
    >
      <TableCell className={`${cellClassName ?? ""} font-medium tabular-nums`}>
        {formatDateTime(sale.createdAt, variant)}
      </TableCell>
      <TableCell className={cellClassName}>
        <Badge variant={sale.status === "VOID" ? "destructive" : "green"}>
          {saleStatusLabels[sale.status]}
        </Badge>
      </TableCell>
      <TableCell className={cellClassName}>
        <Badge
          variant={
            salesOrderTypeBadgeVariants[sale.orderType] as
              | "blue"
              | "indigo"
              | "yellow"
          }
        >
          {salesOrderTypeLabels[sale.orderType]}
        </Badge>
      </TableCell>
      <TableCell className={`${cellClassName ?? ""} text-right tabular-nums`}>
        {sale.items}
      </TableCell>
      <TableCell className={`${cellClassName ?? ""} text-right tabular-nums`}>
        {formatPrice(sale.total, currency)}
      </TableCell>
      <TableCell className={`${cellClassName ?? ""} w-10 text-right`}>
        <ChevronRight
          aria-hidden
          className="text-muted-foreground group-hover:text-foreground"
        />
      </TableCell>
    </TableRow>
  )
}
