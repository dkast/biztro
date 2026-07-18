import NumberFlow from "@number-flow/react"
import { Banknote, ShoppingCart, TrendingUp, WalletCards } from "lucide-react"

import { SalesBestSellersPieChart } from "@/components/sales/sales-best-sellers-pie-chart"
import { SalesRecentSaleRow } from "@/components/sales/sales-recent-sale-row"
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
  icon: typeof Banknote
  format?: Intl.NumberFormatOptions
  locales: string
  suffix?: string
}

function getKpiItems(data: SalesDashboardData) {
  const locales = data.currency === "MXN" ? "es-MX" : "en-US"

  return [
    {
      title: "Ingresos de hoy",
      value: data.todayRevenue,
      icon: Banknote,
      locales,
      format: {
        style: "currency",
        currency: data.currency,
        currencyDisplay: "symbol",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      },
      suffix: ` ${data.currency}`
    },
    {
      title: "Órdenes de hoy",
      value: data.todayOrders,
      icon: ShoppingCart,
      locales,
      format: {
        maximumFractionDigits: 0
      }
    },
    {
      title: "Ingresos acumulados",
      value: data.periodRevenue,
      icon: TrendingUp,
      locales,
      format: {
        style: "currency",
        currency: data.currency,
        currencyDisplay: "symbol",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      },
      suffix: ` ${data.currency}`
    },
    {
      title: "Ticket promedio",
      value: data.periodAverageTicket,
      icon: WalletCards,
      locales,
      format: {
        style: "currency",
        currency: data.currency,
        currencyDisplay: "symbol",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      },
      suffix: ` ${data.currency}`
    }
  ] satisfies SalesDashboardKpiItem[]
}

export function SalesDashboard({ data }: { data: SalesDashboardData }) {
  const kpiItems = getKpiItems(data)
  const hasPeriodSales = data.chart.some(bucket => bucket.revenue > 0)

  return (
    <div className="flex flex-col gap-8 pb-12 sm:gap-10 sm:pb-14">
      <section
        className="inset-ring-border overflow-hidden rounded-lg shadow-sm/5
          inset-ring"
      >
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
                <NumberFlow
                  aria-label={formatPrice(item.value, data.currency)}
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
            Ventas por periodo
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
            <div
              className="border-border/80 w-full max-w-full overflow-x-auto
                rounded-2xl border pb-1"
            >
              <Table className="min-w-[34rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estatus</TableHead>
                    <TableHead>Canal de venta</TableHead>
                    <TableHead className="text-right">Unidades</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>
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
