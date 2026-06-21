import { Banknote, ShoppingCart, TrendingUp, WalletCards } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
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
import {
  salesOrderTypeBadgeVariants,
  salesOrderTypeLabels,
  type SalesDashboardData
} from "@/lib/types/sales"

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
      description: "Ingresos de hoy",
      icon: Banknote
    },
    {
      title: "Órdenes de hoy",
      value: data.todayOrders.toString(),
      description: "Órdenes completadas hoy",
      icon: ShoppingCart
    },
    {
      title: "Ingresos del mes",
      value: formatPrice(data.monthRevenue, data.currency),
      description: "Ingresos del mes",
      icon: TrendingUp
    },
    {
      title: "Ticket promedio",
      value: formatPrice(data.averageTicket, data.currency),
      description: "Promedio por venta hoy",
      icon: WalletCards
    }
  ]
}

export function SalesDashboard({ data }: { data: SalesDashboardData }) {
  return (
    <div className="flex flex-col gap-6 pb-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {getKpiItems(data).map(item => (
          <Card key={item.title} className="overflow-hidden">
            <CardHeader
              className="flex flex-row items-start justify-between gap-4 p-4"
            >
              <div className="space-y-1">
                <CardDescription>{item.title}</CardDescription>
                <CardTitle className="text-2xl">{item.value}</CardTitle>
              </div>
              <div
                className="bg-muted text-foreground flex size-10 items-center
                  justify-center rounded-xl"
              >
                <item.icon />
              </div>
            </CardHeader>
            <CardContent className="px-4 pt-0 pb-4">
              <p className="text-muted-foreground text-xs">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section
        className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
      >
        <Card className="overflow-hidden">
          <CardHeader
            className="flex flex-row items-center justify-between gap-4"
          >
            <div>
              <CardTitle>Ventas recientes</CardTitle>
              <CardDescription>Últimas 25 ventas completadas</CardDescription>
            </div>
            <Badge variant="outline">{data.recentSales.length}</Badge>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentSales.length === 0 ? (
              <div className="p-6">
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
              </div>
            ) : (
              <Table>
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
                      <TableCell className="text-right">{sale.items}</TableCell>
                      <TableCell className="text-right">
                        {formatPrice(sale.total, data.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Más vendidos</CardTitle>
            <CardDescription>
              Top 10 productos por cantidad vendida
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-0 p-0">
            {data.bestSellers.length === 0 ? (
              <div className="p-6">
                <Empty className="min-h-72 rounded-none border-0 p-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Banknote />
                    </EmptyMedia>
                    <EmptyTitle>Sin ventas para analizar</EmptyTitle>
                    <EmptyDescription>
                      Tu ranking de productos aparecerá después de capturar
                      algunas ventas.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            ) : (
              <div className="flex flex-col">
                {data.bestSellers.map((item, index) => (
                  <div key={item.productName}>
                    <div
                      className="flex items-center justify-between gap-4 px-6
                        py-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Badge variant="secondary" className="shrink-0">
                          #{index + 1}
                        </Badge>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {item.productName}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {item.quantity} vendidos
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatPrice(item.revenue, data.currency)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {item.quantity} qty
                        </p>
                      </div>
                    </div>
                    {index < data.bestSellers.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
