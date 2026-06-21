import { Banknote, ShoppingCart } from "lucide-react"

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
  type SalesClosingData
} from "@/lib/types/sales"

function getSummaryItems(data: SalesClosingData) {
  return [
    {
      title: "Ingresos de hoy",
      value: formatPrice(data.todayRevenue, data.currency),
      description: "Ingresos totales del día",
      icon: Banknote
    },
    {
      title: "Órdenes de hoy",
      value: data.todayOrders.toString(),
      description: "Ventas completadas hoy",
      icon: ShoppingCart
    }
  ]
}

export function SalesClosingReport({ data }: { data: SalesClosingData }) {
  return (
    <div className="flex flex-col gap-6 pb-6">
      <section className="grid gap-4 md:grid-cols-2">
        {getSummaryItems(data).map(item => (
          <Card key={item.title}>
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
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]"
      >
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Productos más vendidos</CardTitle>
            <CardDescription>Productos más vendidos del día</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {data.bestSellers.length === 0 ? (
              <div className="p-6">
                <Empty className="min-h-64 rounded-none border-0 p-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ShoppingCart />
                    </EmptyMedia>
                    <EmptyTitle>Sin ventas hoy</EmptyTitle>
                    <EmptyDescription>
                      No hay productos vendidos para el cierre de hoy.
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
                            {item.quantity} unidades
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">
                        {formatPrice(item.revenue, data.currency)}
                      </p>
                    </div>
                    {index < data.bestSellers.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Ingresos por tipo de orden</CardTitle>
            <CardDescription>
              Ventas agrupadas por tipo de orden
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de orden</TableHead>
                  <TableHead className="text-right">Órdenes</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.revenueByOrderType.map(item => (
                  <TableRow key={item.orderType}>
                    <TableCell>
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
                    <TableCell className="text-right">{item.orders}</TableCell>
                    <TableCell className="text-right">
                      {formatPrice(item.revenue, data.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
