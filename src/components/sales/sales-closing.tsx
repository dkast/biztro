import { Fragment } from "react"
import NumberFlow, { type Format } from "@number-flow/react"
import {
  Banknote,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Trophy,
  WalletCards
} from "lucide-react"

import { SalesClosingHourlyChart } from "@/components/sales/sales-closing-hourly-chart"
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
  ItemSeparator,
  ItemTitle
} from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
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
    ? { label, tone: "text-green-600 dark:text-green-400", icon: TrendingUp }
    : { label, tone: "text-muted-foreground", icon: TrendingDown }
}

function formatClosingTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    timeStyle: "short"
  }).format(new Date(value))
}

type SalesClosingSummaryItem = {
  title: string
  icon: typeof Banknote
  trend?: ClosingTrend | null
} & (
  | { kind: "currency"; value: number }
  | { kind: "count"; value: number }
  | { kind: "text"; value: string; meta?: string }
)

function getSummaryItems(data: SalesClosingData): SalesClosingSummaryItem[] {
  return [
    {
      title: "Ingresos del día",
      kind: "currency",
      value: data.todayRevenue,
      icon: Banknote,
      trend: getClosingTrend(data.todayRevenue, data.previous.revenue)
    },
    {
      title: "Órdenes del día",
      kind: "count",
      value: data.todayOrders,
      icon: ShoppingCart,
      trend: getClosingTrend(data.todayOrders, data.previous.orders)
    },
    {
      title: "Ticket promedio",
      kind: "currency",
      value: data.todayAverageTicket,
      icon: WalletCards,
      trend: getClosingTrend(
        data.todayAverageTicket,
        data.previous.averageTicket
      )
    },
    {
      title: "Producto más vendido",
      kind: "text",
      value: data.topProduct?.productName ?? "Sin ventas",
      icon: Trophy,
      meta: data.topProduct
        ? `${data.topProduct.quantity} unidades · ${formatPrice(
            data.topProduct.revenue,
            data.currency
          )}`
        : undefined
    }
  ]
}

export function SalesClosingReport({ data }: { data: SalesClosingData }) {
  const selectedDateLabel =
    formatSalesClosingDateLongLabel(data.selectedDateValue) ||
    "la fecha seleccionada"
  const summaryItems = getSummaryItems(data)
  const currencyLocale = data.currency === "MXN" ? "es-MX" : "en-US"
  const currencyFormat: Format = {
    style: "currency",
    currency: data.currency,
    currencyDisplay: "symbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }

  return (
    <div className="flex flex-col gap-8 pb-6">
      <section className="border-border overflow-hidden rounded-lg border">
        <ItemGroup className="grid grid-cols-2 md:grid-cols-4">
          {summaryItems.map((item, index) => (
            <Item
              key={item.title}
              className={cn(
                "min-w-0 flex-nowrap rounded-none border-0 px-4 py-3 sm:px-5",
                index < 2 && "border-border/80 border-b md:border-b-0",
                index % 2 === 0 && "border-border/80 border-r md:border-r-0",
                index < summaryItems.length - 1 &&
                  "md:border-border/80 md:border-r"
              )}
            >
              <ItemContent className="min-w-0 gap-1">
                <ItemTitle
                  className="text-muted-foreground w-full text-sm font-medium"
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
                      item.kind === "currency" ? ` ${data.currency}` : undefined
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
                  <p className="text-muted-foreground truncate pt-2 text-xs">
                    {item.meta}
                  </p>
                )}
              </ItemContent>
              <ItemMedia variant="icon">
                <item.icon className="size-4" />
              </ItemMedia>
            </Item>
          ))}
        </ItemGroup>
      </section>

      <section className="space-y-3">
        <div
          className="flex flex-col items-start gap-2 sm:flex-row sm:items-center
            sm:justify-between sm:gap-4"
        >
          <h2 className="text-base font-semibold text-balance">
            Ventas por hora
          </h2>
        </div>
        <Separator className="bg-border/80" />
        <SalesClosingHourlyChart
          hourly={data.hourly}
          currency={data.currency}
        />
      </section>

      <section
        className="grid gap-y-6 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]
          lg:items-start lg:gap-x-8 lg:gap-y-0"
      >
        <div className="min-w-0 space-y-3">
          <div
            className="flex flex-col items-start gap-2 sm:flex-row
              sm:items-center sm:justify-between sm:gap-4"
          >
            <h2 className="text-base font-semibold text-balance">
              Ingresos por tipo de orden
            </h2>
            <Badge variant="secondary">{data.revenueByOrderType.length}</Badge>
          </div>
          <Separator className="bg-border/80" />
          <div className="w-full max-w-full overflow-x-auto pb-1">
            <Table className="min-w-[22rem]">
              <TableHeader>
                <TableRow>
                  <TableHead className="h-9 px-3">Tipo de orden</TableHead>
                  <TableHead className="h-9 px-3 text-right">Órdenes</TableHead>
                  <TableHead className="h-9 px-3 text-right">
                    Ingresos
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.revenueByOrderType.map(item => (
                  <TableRow key={item.orderType}>
                    <TableCell className="px-3 py-2.5">
                      <Badge
                        variant={
                          salesOrderTypeBadgeVariants[item.orderType] as
                            | "blue"
                            | "indigo"
                            | "yellow"
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

        <Separator className="bg-border/80 lg:h-full lg:w-px" />

        <div className="min-w-0 space-y-3">
          <div
            className="flex flex-col items-start gap-2 sm:flex-row
              sm:items-center sm:justify-between sm:gap-4"
          >
            <h2 className="text-base font-semibold text-balance">
              Productos más vendidos
            </h2>
            <Badge variant="secondary">{data.bestSellers.length}</Badge>
          </div>
          <Separator className="bg-border/80" />
          {data.bestSellers.length === 0 ? (
            <Empty className="min-h-48 rounded-none border-0 p-0">
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
            <ItemGroup className="gap-0">
              {data.bestSellers.map((item, index) => (
                <Fragment key={item.productName}>
                  <Item className="rounded-none px-0 py-2.5">
                    <ItemMedia variant="icon" className="rounded-full">
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
                  {index < data.bestSellers.length - 1 && <ItemSeparator />}
                </Fragment>
              ))}
            </ItemGroup>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div
          className="flex flex-col items-start gap-2 sm:flex-row sm:items-center
            sm:justify-between sm:gap-4"
        >
          <h2 className="text-base font-semibold text-balance">
            Ventas recientes
          </h2>
          <Badge variant="secondary">{data.recentSales.length}</Badge>
        </div>
        <Separator className="bg-border/80" />
        {data.recentSales.length === 0 ? (
          <Empty className="min-h-48 rounded-none border-0 p-0">
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
          <div className="w-full max-w-full overflow-x-auto pb-1">
            <Table className="min-w-[30rem]">
              <TableHeader>
                <TableRow>
                  <TableHead className="h-9 px-3">Hora</TableHead>
                  <TableHead className="h-9 px-3">Canal de venta</TableHead>
                  <TableHead className="h-9 px-3 text-right">
                    Unidades
                  </TableHead>
                  <TableHead className="h-9 px-3 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentSales.map(sale => (
                  <TableRow key={sale.id}>
                    <TableCell className="px-3 py-2.5 font-medium tabular-nums">
                      {formatClosingTime(sale.createdAt)}
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
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
                    <TableCell className="px-3 py-2.5 text-right tabular-nums">
                      {sale.items}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-right tabular-nums">
                      {formatPrice(sale.total, data.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  )
}
