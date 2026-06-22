import { Fragment } from "react"
import { Banknote, ShoppingCart, TrendingUp, WalletCards } from "lucide-react"

import { SalesRevenueChart } from "@/components/sales/sales-revenue-chart"
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
import { salesDashboardPeriodRangeLabels } from "@/lib/sales-dashboard-period"
import {
  salesOrderTypeBadgeVariants,
  salesOrderTypeLabels,
  type SalesDashboardData
} from "@/lib/types/sales"
import { cn } from "@/lib/utils"

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

function getKpiItems(data: SalesDashboardData) {
  return [
    {
      title: "Ingresos de hoy",
      value: formatPrice(data.todayRevenue, data.currency),
      icon: Banknote
    },
    {
      title: "Órdenes de hoy",
      value: data.todayOrders.toString(),
      icon: ShoppingCart
    },
    {
      title: "Ingresos acumulados",
      value: formatPrice(data.periodRevenue, data.currency),
      icon: TrendingUp
    },
    {
      title: "Ticket promedio",
      value: formatPrice(data.periodAverageTicket, data.currency),
      icon: WalletCards
    }
  ]
}

export function SalesDashboard({ data }: { data: SalesDashboardData }) {
  const kpiItems = getKpiItems(data)

  return (
    <div className="flex flex-col gap-6 pb-6">
      <section className="border-border overflow-hidden rounded-lg border">
        <ItemGroup className="grid grid-cols-2 md:grid-cols-4">
          {kpiItems.map((item, index) => (
            <Item
              key={item.title}
              className={cn(
                "min-w-0 flex-nowrap rounded-none border-0 px-4 py-4 sm:px-5",
                index < 2 && "border-border/80 border-b md:border-b-0",
                index % 2 === 0 && "border-border/80 border-r md:border-r-0",
                index < kpiItems.length - 1 && "md:border-border/80 md:border-r"
              )}
            >
              <ItemContent className="min-w-0 gap-1">
                <ItemTitle
                  className="text-muted-foreground w-full text-sm font-medium"
                >
                  {item.title}
                </ItemTitle>
                <p
                  className="text-foreground text-xl font-semibold tabular-nums
                    sm:text-2xl"
                >
                  {item.value}
                </p>
              </ItemContent>
              <ItemMedia variant="icon" className="rounded-xl">
                <item.icon className="size-4" />
              </ItemMedia>
            </Item>
          ))}
        </ItemGroup>
      </section>

      <section className="space-y-4 py-6 sm:space-y-5 sm:py-8">
        <div
          className="flex flex-col items-start gap-2 sm:flex-row sm:items-center
            sm:justify-between sm:gap-4"
        >
          <h2 className="text-base font-semibold text-balance">
            Ventas a través del tiempo
          </h2>
          <Badge variant="outline">
            {salesDashboardPeriodRangeLabels[data.period]}
          </Badge>
        </div>
        <Separator className="bg-border/80" />
        <div className="px-1 pt-1">
          <SalesRevenueChart
            chart={data.chart}
            currency={data.currency}
            period={data.period}
          />
        </div>
      </section>

      <Separator className="bg-border/80" />

      <section
        className="grid gap-y-6 xl:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]
          xl:items-start xl:gap-x-8 xl:gap-y-0"
      >
        <div className="space-y-4">
          <div
            className="flex flex-col items-start gap-2 sm:flex-row
              sm:items-center sm:justify-between sm:gap-4"
          >
            <h2 className="text-base font-semibold text-balance">
              Ventas recientes
            </h2>
            <Badge variant="outline">{data.recentSales.length}</Badge>
          </div>
          <Separator className="bg-border/80" />
          {data.recentSales.length === 0 ? (
            <Empty className="min-h-72 rounded-none border-0 p-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShoppingCart />
                </EmptyMedia>
                <EmptyTitle>No hay ventas aún</EmptyTitle>
                <EmptyDescription>
                  Cuando completes la primera venta, aparecerá aquí.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table className="min-w-[34rem]">
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo de orden</TableHead>
                  <TableHead className="text-right">Artículos</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentSales.map(sale => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {formatDateTime(sale.createdAt)}
                    </TableCell>
                    <TableCell>
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
                    <TableCell className="text-right tabular-nums">
                      {sale.items}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(sale.total, data.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <Separator className="bg-border/80 xl:h-full xl:w-px" />

        <div className="space-y-4">
          <div
            className="flex flex-col items-start gap-2 sm:flex-row
              sm:items-center sm:justify-between sm:gap-4"
          >
            <h2 className="text-base font-semibold text-balance">
              Más vendidos
            </h2>
            <Badge variant="outline">{data.bestSellers.length}</Badge>
          </div>
          <Separator className="bg-border/80" />
          {data.bestSellers.length === 0 ? (
            <Empty className="min-h-72 rounded-none border-0 p-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Banknote />
                </EmptyMedia>
                <EmptyTitle>Sin ventas para analizar</EmptyTitle>
                <EmptyDescription>
                  Tu ranking de productos aparecerá cuando haya ventas en el
                  periodo seleccionado.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ItemGroup className="gap-0">
              {data.bestSellers.map((item, index) => (
                <Fragment key={item.productName}>
                  <Item className="rounded-none px-0 py-4">
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
    </div>
  )
}
