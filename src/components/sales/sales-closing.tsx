import NumberFlow, { type Format } from "@number-flow/react"
import { ShoppingCart, TrendingDown, TrendingUp } from "lucide-react"

import { SalesClosingCollectionsPieChart } from "@/components/sales/sales-closing-collections-pie-chart"
import { SalesClosingHourlyChart } from "@/components/sales/sales-closing-hourly-chart"
import { SalesRecentSaleRow } from "@/components/sales/sales-recent-sale-row"
import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { formatPrice } from "@/lib/currency"
import { formatSalesClosingDateLongLabel } from "@/lib/sales-closing-date"
import { paymentMethodLabels } from "@/lib/types/payments"
import {
  salesOrderTypeBadgeVariants,
  salesOrderTypeLabels,
  type SalesClosingData
} from "@/lib/types/sales"
import { cn } from "@/lib/utils"

const closingTrendPercentFormatter = new Intl.NumberFormat("es-MX", {
  style: "percent",
  signDisplay: "exceptZero",
  maximumFractionDigits: 0
})

type ClosingTrend = {
  label: string
  tone: string
  icon: typeof TrendingUp
}

function getClosingTrend(
  currentValue: number,
  previousValue: number
): ClosingTrend | null {
  if (previousValue <= 0) {
    if (currentValue <= 0) return null
    return {
      label: "Nuevo vs. ayer",
      tone: "text-green-600 dark:text-green-400",
      icon: TrendingUp
    }
  }

  const change = (currentValue - previousValue) / previousValue

  if (Math.abs(change) < 0.005) {
    return null
  }

  const label = `${closingTrendPercentFormatter.format(change)} vs. ayer`

  return change > 0
    ? {
        label,
        tone: "text-emerald-600 dark:text-emerald-400",
        icon: TrendingUp
      }
    : {
        label,
        tone: "text-orange-600 dark:text-orange-400",
        icon: TrendingDown
      }
}

type SalesClosingSummaryItem = {
  title: string
  trend?: ClosingTrend | null
} & (
  | { kind: "currency"; value: number }
  | { kind: "count"; value: number }
  | { kind: "text"; value: string; meta?: string }
)

function getSummaryItems(data: SalesClosingData): SalesClosingSummaryItem[] {
  const items: SalesClosingSummaryItem[] = [
    {
      title: "Ventas del día",
      kind: "currency",
      value: data.todaySales,
      trend: getClosingTrend(data.todaySales, data.previous.sales)
    },
    {
      title: "Cobrado del día",
      kind: "currency",
      value: data.todayCollected,
      trend: getClosingTrend(data.todayCollected, data.previous.collected)
    },
    {
      title: "Ventas completadas",
      kind: "count",
      value: data.todayOrders,
      trend: getClosingTrend(data.todayOrders, data.previous.orders)
    },
    {
      title: "Ticket promedio",
      kind: "currency",
      value: data.todayAverageTicket,
      trend: getClosingTrend(
        data.todayAverageTicket,
        data.previous.averageTicket
      )
    },
    {
      title: "Producto más vendido",
      kind: "text",
      value: data.topProduct?.productName ?? "Sin ventas",
      meta: data.topProduct
        ? `${data.topProduct.quantity} unidades · ${formatPrice(
            data.topProduct.revenue,
            data.currency
          )}`
        : undefined
    }
  ]

  const hasCreditActivity =
    data.todayCreditGenerated > 0 ||
    data.todayReceivableCollection > 0 ||
    data.collectionBreakdown.some(row => row.origin === "RECEIVABLE")

  if (!hasCreditActivity) return items

  return [
    ...items.slice(0, 2),
    {
      title: "Pagado al vender",
      kind: "currency",
      value: data.todayPaidAtSale,
      trend: getClosingTrend(data.todayPaidAtSale, data.previous.paidAtSale)
    },
    {
      title: "Crédito generado",
      kind: "currency",
      value: data.todayCreditGenerated,
      trend: getClosingTrend(
        data.todayCreditGenerated,
        data.previous.creditGenerated
      )
    },
    {
      title: "Abonos de cartera",
      kind: "currency",
      value: data.todayReceivableCollection,
      trend: getClosingTrend(
        data.todayReceivableCollection,
        data.previous.receivableCollection
      )
    },
    ...items.slice(2)
  ]
}

function getPaymentMethodLabel(method: string) {
  return method === "LEGACY"
    ? "Pago histórico"
    : paymentMethodLabels[method as keyof typeof paymentMethodLabels]
}

export function SalesClosingReport({ data }: { data: SalesClosingData }) {
  const selectedDateLabel =
    formatSalesClosingDateLongLabel(data.selectedDateValue) ||
    "la fecha seleccionada"
  const summaryItems = getSummaryItems(data)
  const collectionContext = [
    data.todayReceivableCollection > 0 &&
      "Cobrado del día incluye abonos de cartera.",
    data.todayCreditGenerated > 0 &&
      "Crédito generado son ventas pendientes de cobro."
  ]
    .filter(Boolean)
    .join(" ")
  const currencyLocale = data.currency === "MXN" ? "es-MX" : "en-US"
  const currencyFormat: Format = {
    style: "currency",
    currency: data.currency,
    currencyDisplay: "symbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }

  return (
    <div className="flex flex-col gap-10 pb-6 sm:gap-12">
      <div className="rounded-xl bg-gray-200/50 dark:bg-gray-900/70">
        <section
          className="inset-ring-border overflow-hidden rounded-lg border
            shadow-sm/5 inset-ring"
        >
          <ItemGroup
            className="bg-border grid grid-cols-2 gap-px md:grid-cols-2
              xl:grid-cols-5"
          >
            {summaryItems.map((item, index) => (
              <Item
                key={item.title}
                className={cn(
                  `bg-background min-w-0 flex-nowrap items-start rounded-none
                  border-0 px-4 py-3 sm:px-5`,
                  index === summaryItems.length - 1 &&
                    summaryItems.length === 5 &&
                    "col-span-2 md:col-span-2 xl:col-span-1",
                  index === summaryItems.length - 1 &&
                    summaryItems.length === 8 &&
                    "md:col-span-2 xl:col-span-3"
                )}
              >
                <ItemContent className="min-w-0 gap-2">
                  <ItemTitle
                    className="text-muted-foreground w-full text-sm leading-5
                      font-medium"
                  >
                    {item.title}
                  </ItemTitle>
                  {item.kind === "text" ? (
                    <p
                      className="text-foreground truncate text-lg leading-none
                        font-semibold sm:text-xl"
                    >
                      {item.value}
                    </p>
                  ) : (
                    <NumberFlow
                      aria-label={
                        item.kind === "currency"
                          ? formatPrice(item.value, data.currency)
                          : item.value.toString()
                      }
                      className="text-foreground text-lg leading-none
                        font-semibold tabular-nums sm:text-xl"
                      value={item.value}
                      locales={
                        item.kind === "currency" ? currencyLocale : "es-MX"
                      }
                      format={
                        item.kind === "currency" ? currencyFormat : undefined
                      }
                      suffix={
                        item.kind === "currency"
                          ? ` ${data.currency}`
                          : undefined
                      }
                    />
                  )}
                  {item.trend && (
                    <span
                      className={cn(
                        "flex w-fit items-center gap-1 text-xs font-medium",
                        item.trend.tone
                      )}
                    >
                      <item.trend.icon className="size-3" />
                      {item.trend.label}
                    </span>
                  )}
                  {item.kind === "text" && item.meta && !item.trend && (
                    <p className="text-muted-foreground truncate text-xs">
                      {item.meta}
                    </p>
                  )}
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </section>
        {collectionContext && (
          <div className="text-muted-foreground/70 w-full px-4 py-2 text-sm">
            <p className="text-muted-foreground text-sm">{collectionContext}</p>
          </div>
        )}
      </div>

      <section
        className="grid w-full min-w-0 gap-8 xl:grid-cols-6 xl:items-start
          xl:gap-10"
      >
        <section className="min-w-0 space-y-4 xl:col-span-4">
          <h2 className="text-base font-semibold text-balance">
            Ventas por hora
          </h2>
          <SalesClosingHourlyChart
            hourly={data.hourly}
            currency={data.currency}
          />
        </section>

        <section className="min-w-0 space-y-5 xl:col-span-2">
          <div>
            <h2 className="text-base font-semibold text-balance">
              Métodos de cobro
            </h2>
            <p className="text-muted-foreground text-sm">
              Distribución del dinero recibido
            </p>
          </div>
          <SalesClosingCollectionsPieChart
            chart={data.collectionChart}
            currency={data.currency}
          />
        </section>

        <div className="order-5 min-w-0 space-y-4 xl:col-span-3">
          <div
            className="flex flex-col items-start gap-2 sm:flex-row
              sm:items-center sm:justify-between sm:gap-4"
          >
            <h2 className="text-base font-semibold text-balance">
              Productos más vendidos
            </h2>
            <Badge variant="secondary">{data.bestSellers.length}</Badge>
          </div>
          <div className="border-border overflow-hidden rounded-lg border">
            {data.bestSellers.length === 0 ? (
              <Empty className="min-h-48 rounded-none border-0 p-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ShoppingCart />
                  </EmptyMedia>
                  <EmptyTitle>Sin ventas para este día</EmptyTitle>
                  <EmptyDescription>
                    No hay productos vendidos para el cierre de{" "}
                    {selectedDateLabel}.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ItemGroup className="gap-1 p-2">
                {data.bestSellers.map((item, index) => (
                  <Item
                    key={item.productName}
                    className="rounded-md px-3 py-2.5"
                  >
                    <ItemMedia
                      className="text-muted-foreground w-6 justify-start"
                    >
                      <span className="text-xs font-semibold tabular-nums">
                        #{index + 1}
                      </span>
                    </ItemMedia>
                    <ItemContent className="min-w-0 gap-1">
                      <ItemTitle className="w-full truncate">
                        {item.productName}
                      </ItemTitle>
                    </ItemContent>
                    <ItemActions
                      className="ml-auto flex flex-col items-end gap-1 pl-3"
                    >
                      <p className="font-medium tabular-nums">
                        {formatPrice(item.revenue, data.currency)}
                      </p>
                      <p className="text-muted-foreground text-xs tabular-nums">
                        {item.quantity} unidades
                      </p>
                    </ItemActions>
                  </Item>
                ))}
              </ItemGroup>
            )}
          </div>
        </div>

        <div className="order-2 min-w-0 space-y-4 xl:col-span-3">
          <div
            className="flex flex-col items-start gap-2 sm:flex-row
              sm:items-center sm:justify-between sm:gap-4"
          >
            <h2 className="text-base font-semibold text-balance">
              Ventas por tipo de orden
            </h2>
            <Badge variant="secondary">{data.revenueByOrderType.length}</Badge>
          </div>
          <div className="border-border overflow-hidden rounded-lg border">
            <Table className="min-w-88">
              <TableHeader>
                <TableRow>
                  <TableHead className="h-9 px-3">Tipo de orden</TableHead>
                  <TableHead className="h-9 px-3 text-right">Órdenes</TableHead>
                  <TableHead className="h-9 px-3 text-right">Ventas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.revenueByOrderType.map(item => (
                  <TableRow key={item.orderType}>
                    <TableCell className="px-3 py-2.5">
                      <Badge
                        variant={
                          salesOrderTypeBadgeVariants[item.orderType] as
                            "blue" | "indigo" | "yellow"
                        }
                      >
                        {salesOrderTypeLabels[item.orderType]}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-right tabular-nums">
                      {item.orders}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-right tabular-nums">
                      {formatPrice(item.revenue, data.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <section className="order-3 min-w-0 space-y-3 xl:col-span-3">
          <div>
            <h2 className="text-sm font-semibold text-balance">
              Desglose para conciliación
            </h2>
            <p className="text-muted-foreground text-sm">
              Cobros por método y origen
            </p>
          </div>
          <div className="border-border overflow-hidden rounded-lg border">
            <Table className="min-w-120">
              <TableHeader>
                <TableRow>
                  <TableHead className="h-9 px-3">Método</TableHead>
                  <TableHead className="h-9 px-3">Origen</TableHead>
                  <TableHead className="h-9 px-3 text-right">Pagos</TableHead>
                  <TableHead className="h-9 px-3 text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.collectionBreakdown.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground px-3 py-6 text-center"
                    >
                      No hubo cobros en esta fecha.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.collectionBreakdown.map(row => (
                    <TableRow key={`${row.method}-${row.origin}`}>
                      <TableCell className="px-3 py-2.5">
                        {getPaymentMethodLabel(row.method)}
                      </TableCell>
                      <TableCell className="text-muted-foreground px-3 py-2.5">
                        {row.origin === "RECEIVABLE"
                          ? "Abono de cartera"
                          : "Cobro de venta"}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right tabular-nums">
                        {row.payments}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right tabular-nums">
                        {formatPrice(row.amount, data.currency)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {data.collectionBreakdown.length > 0 && (
                  <TableRow className="bg-muted/30 font-medium">
                    <TableCell className="px-3 py-2.5" colSpan={3}>
                      Total cobrado
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-right tabular-nums">
                      {formatPrice(data.todayCollected, data.currency)}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="order-4 min-w-0 space-y-4 xl:col-span-3">
          <div
            className="flex flex-col items-start gap-2 sm:flex-row
              sm:items-center sm:justify-between sm:gap-4"
          >
            <h2 className="text-base font-semibold text-balance">
              Ventas recientes
            </h2>
            <Badge variant="secondary">{data.recentSales.length}</Badge>
          </div>
          <div className="border-border overflow-hidden rounded-lg border">
            {data.recentSales.length === 0 ? (
              <Empty className="min-h-48 rounded-none border-0 p-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ShoppingCart />
                  </EmptyMedia>
                  <EmptyTitle>Sin ventas registradas</EmptyTitle>
                  <EmptyDescription>
                    Aún no hay ventas registradas para el cierre de{" "}
                    {selectedDateLabel}.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table className="min-w-120">
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-9 px-3">Hora</TableHead>
                    <TableHead className="h-9 px-3">Estatus</TableHead>
                    <TableHead className="h-9 px-3">Canal de venta</TableHead>
                    <TableHead className="h-9 px-3 text-right">
                      Unidades
                    </TableHead>
                    <TableHead className="h-9 px-3 text-right">Total</TableHead>
                    <TableHead className="h-9 px-3">
                      <span className="sr-only">Detalle</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentSales.map(sale => (
                    <SalesRecentSaleRow
                      key={sale.id}
                      sale={sale}
                      currency={data.currency}
                      variant="closing"
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>
      </section>
    </div>
  )
}
