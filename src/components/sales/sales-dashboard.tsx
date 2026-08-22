import NumberFlow from "@number-flow/react"
import {
  ArrowRight,
  Banknote,
  CircleDollarSign,
  ShoppingCart,
  WalletCards
} from "lucide-react"
import Link from "next/link"

import { SalesBestSellersPieChart } from "@/components/sales/sales-best-sellers-pie-chart"
import { SalesCollectionsChart } from "@/components/sales/sales-collections-chart"
import { SalesRecentSaleRow } from "@/components/sales/sales-recent-sale-row"
import { SalesRevenueChart } from "@/components/sales/sales-revenue-chart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { formatPrice } from "@/lib/currency"
import { salesDashboardPeriodRangeLabels } from "@/lib/sales-dashboard-period"
import { type SalesDashboardData } from "@/lib/types/sales"
import { cn } from "@/lib/utils"

type SalesDashboardKpiItem = {
  title: string
  value: number
  ariaLabel: string
  icon: typeof Banknote
  format?: Intl.NumberFormatOptions
  locales: string
  suffix?: string
}

function getKpiItems(data: SalesDashboardData) {
  const locales = data.currency === "MXN" ? "es-MX" : "en-US"
  const currencyFormat = {
    style: "currency",
    currency: data.currency,
    currencyDisplay: "symbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  } satisfies Intl.NumberFormatOptions

  return [
    {
      title: "Ventas",
      value: data.periodSales,
      ariaLabel: formatPrice(data.periodSales, data.currency),
      icon: Banknote,
      locales,
      format: currencyFormat,
      suffix: ` ${data.currency}`
    },
    {
      title: "Cobrado",
      value: data.periodCollected,
      ariaLabel: formatPrice(data.periodCollected, data.currency),
      icon: WalletCards,
      locales,
      format: currencyFormat,
      suffix: ` ${data.currency}`
    },
    {
      title: "Órdenes",
      value: data.periodOrders,
      ariaLabel: `${data.periodOrders} órdenes`,
      icon: ShoppingCart,
      locales,
      format: { maximumFractionDigits: 0 }
    },
    {
      title: "Ticket promedio",
      value: data.periodAverageTicket,
      ariaLabel: formatPrice(data.periodAverageTicket, data.currency),
      icon: CircleDollarSign,
      locales,
      format: currencyFormat,
      suffix: ` ${data.currency}`
    }
  ] satisfies SalesDashboardKpiItem[]
}

export function SalesDashboard({ data }: { data: SalesDashboardData }) {
  const kpiItems = getKpiItems(data)
  const hasPeriodSales = data.chart.some(bucket => bucket.sales > 0)
  const currentReceivable = data.receivables.find(
    summary => summary.currency === data.currency && summary.balanceMinor > 0
  )

  return (
    <div className="flex flex-col gap-8 pb-12 sm:gap-10 sm:pb-14">
      <section className="flex flex-col gap-4">
        <div
          className="flex flex-col gap-2 sm:flex-row sm:items-end
            sm:justify-between sm:gap-4"
        >
          <div>
            <h2 className="text-base font-semibold">Resumen</h2>
            <p className="text-muted-foreground text-sm">
              {salesDashboardPeriodRangeLabels[data.period]}
            </p>
          </div>
          <p className="text-muted-foreground text-sm">
            Hoy:{" "}
            <span className="text-foreground font-medium tabular-nums">
              {formatPrice(data.todaySales, data.currency)}
            </span>{" "}
            · {data.todayOrders} {data.todayOrders === 1 ? "orden" : "órdenes"}
          </p>
        </div>
        <ItemGroup
          className="inset-ring-border grid grid-cols-2 overflow-hidden
            rounded-lg shadow-sm/5 inset-ring md:grid-cols-4"
        >
          {kpiItems.map((item, index) => (
            <Item
              key={item.title}
              className={cn(
                "min-w-0 flex-nowrap rounded-none border-0 px-4 py-4 sm:px-5",
                index < 2 && "border-border/80 border-b md:border-b-0",
                index % 2 === 0 && "border-border/80 border-r",
                index < kpiItems.length - 1 && "md:border-border/80 md:border-r"
              )}
            >
              <ItemContent className="min-w-0 gap-1">
                <ItemTitle
                  className="text-muted-foreground w-full text-sm font-medium"
                >
                  {item.title}
                </ItemTitle>
                <NumberFlow
                  aria-label={item.ariaLabel}
                  className="text-foreground text-xl leading-none font-semibold
                    tabular-nums sm:text-2xl"
                  value={item.value}
                  locales={item.locales}
                  format={item.format}
                  suffix={item.suffix}
                />
              </ItemContent>
              <ItemMedia variant="icon">
                <item.icon className="size-4" />
              </ItemMedia>
            </Item>
          ))}
        </ItemGroup>
      </section>

      <section className="flex flex-col gap-5 sm:gap-6">
        <div
          className="flex flex-col items-start gap-2 sm:flex-row sm:items-center
            sm:justify-between sm:gap-4"
        >
          <h2 className="text-base font-semibold text-balance">
            Ventas: pagado vs. crédito
          </h2>
          <Badge variant="secondary">
            {salesDashboardPeriodRangeLabels[data.period]}
          </Badge>
        </div>
        <div
          className={cn(
            "rounded-lg",
            hasPeriodSales ? "px-1 pt-1" : "overflow-hidden"
          )}
        >
          <SalesRevenueChart
            chart={data.chart}
            currency={data.currency}
            period={data.period}
          />
        </div>
      </section>

      <section className="flex flex-col gap-5 sm:gap-6">
        <div
          className="flex flex-col items-start gap-2 sm:flex-row sm:items-center
            sm:justify-between sm:gap-4"
        >
          <div>
            <h2 className="text-base font-semibold text-balance">
              Cobros por método
            </h2>
            <p className="text-muted-foreground text-sm">
              Dinero recibido, incluidos los abonos de cartera
            </p>
          </div>
          <Badge variant="secondary">
            {salesDashboardPeriodRangeLabels[data.period]}
          </Badge>
        </div>
        <SalesCollectionsChart
          chart={data.collectionChart}
          currency={data.currency}
          period={data.period}
        />
        <p className="text-muted-foreground text-sm">
          Cobros de ventas:{" "}
          <span className="text-foreground font-medium tabular-nums">
            {formatPrice(
              data.periodCollected - data.periodReceivableCollection,
              data.currency
            )}
          </span>{" "}
          · Abonos de cartera:{" "}
          <span className="text-foreground font-medium tabular-nums">
            {formatPrice(data.periodReceivableCollection, data.currency)}
          </span>
        </p>
      </section>

      {currentReceivable && (
        <section
          className="border-border flex flex-col gap-4 border-y py-5 sm:flex-row
            sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <ItemMedia variant="icon">
              <WalletCards className="size-4" />
            </ItemMedia>
            <div>
              <h2 className="text-base font-semibold">Saldo por cobrar</h2>
              <p className="text-muted-foreground text-sm">
                {currentReceivable.customers}{" "}
                {currentReceivable.customers === 1 ? "cliente" : "clientes"} ·{" "}
                {currentReceivable.openSales}{" "}
                {currentReceivable.openSales === 1
                  ? "venta abierta"
                  : "ventas abiertas"}
              </p>
            </div>
          </div>
          <div
            className="flex items-center justify-between gap-4 sm:justify-end"
          >
            <p className="text-xl font-semibold tabular-nums">
              {formatPrice(
                currentReceivable.balanceMinor / 100,
                currentReceivable.currency
              )}
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/sales/receivables">
                Ver cartera
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      <section
        className="grid gap-y-8 lg:grid-cols-[minmax(0,60fr)_minmax(0,40fr)]
          lg:items-stretch lg:gap-x-10 lg:gap-y-0"
      >
        <div className="flex min-w-0 flex-col gap-4">
          <div
            className="flex min-h-9.5 flex-col items-start gap-2 sm:flex-row
              sm:items-center sm:justify-between sm:gap-4"
          >
            <h2 className="text-base font-semibold text-balance">
              Ventas recientes
            </h2>
            <Badge variant="secondary">{data.recentSales.length}</Badge>
          </div>
          {data.recentSales.length === 0 ? (
            <div
              className="border-border flex flex-1 overflow-hidden rounded-lg
                border"
            >
              <Empty
                className="min-h-72 flex-1 rounded-none border-0 p-6 md:p-10"
              >
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ShoppingCart />
                  </EmptyMedia>
                  <EmptyTitle>Aún no hay ventas registradas</EmptyTitle>
                  <EmptyDescription>
                    Registra la primera venta para verla aquí.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <div className="border-border/80 w-full rounded-lg border pb-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-2 sm:px-4">Fecha</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Estado de pago
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Canal de venta
                    </TableHead>
                    <TableHead className="hidden text-right sm:table-cell">
                      Unidades
                    </TableHead>
                    <TableHead className="px-2 text-right sm:px-4">
                      Total
                    </TableHead>
                    <TableHead className="px-2 sm:px-4">
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
                      variant="dashboard"
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {data.bestSellers.length === 0 ? (
            <>
              <div
                className="flex min-h-9.5 flex-col items-start gap-2 sm:flex-row
                  sm:items-center sm:justify-between sm:gap-4"
              >
                <h2 className="text-base font-semibold text-balance">
                  Productos más vendidos
                </h2>
                <Badge variant="secondary">0</Badge>
              </div>
              <div
                className="border-border flex flex-1 overflow-hidden rounded-lg
                  border"
              >
                <Empty
                  className="min-h-72 flex-1 rounded-none border-0 p-6 md:p-10"
                >
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Banknote />
                    </EmptyMedia>
                    <EmptyTitle>Aún no hay productos vendidos</EmptyTitle>
                    <EmptyDescription>
                      Cuando haya ventas, aquí verás el ranking de productos.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <SalesBestSellersPieChart
                bestSellers={data.bestSellers}
                currency={data.currency}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
