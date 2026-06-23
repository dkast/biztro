import { Fragment } from "react"
import { Banknote, ShoppingCart } from "lucide-react"

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

function getSummaryItems(data: SalesClosingData) {
  return [
    {
      title: "Ingresos del día",
      value: formatPrice(data.todayRevenue, data.currency),
      icon: Banknote
    },
    {
      title: "Órdenes del día",
      value: data.todayOrders.toString(),
      icon: ShoppingCart
    }
  ]
}

export function SalesClosingReport({ data }: { data: SalesClosingData }) {
  const selectedDateLabel =
    formatSalesClosingDateLongLabel(data.selectedDateValue) ||
    "la fecha seleccionada"

  return (
    <div className="flex flex-col gap-6 pb-6">
      <section className="border-border overflow-hidden rounded-lg border">
        <ItemGroup className="grid md:grid-cols-2">
          {getSummaryItems(data).map((item, index) => (
            <Item
              key={item.title}
              className={cn(
                "min-w-0 flex-nowrap rounded-none border-0 px-4 py-4 sm:px-5",
                index === 0 &&
                  "border-border/80 border-b md:border-r md:border-b-0"
              )}
            >
              <ItemContent className="min-w-0 gap-1">
                <ItemTitle
                  className="text-muted-foreground w-full text-sm font-medium"
                >
                  {item.title}
                </ItemTitle>
                <p
                  className="text-foreground text-xl leading-none font-semibold
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

      <Separator className="bg-border/80" />

      <section
        className="grid gap-y-6 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]
          lg:items-start lg:gap-x-8 lg:gap-y-0"
      >
        <div className="min-w-0 space-y-4">
          <div
            className="flex flex-col items-start gap-2 sm:flex-row
              sm:items-center sm:justify-between sm:gap-4"
          >
            <h2 className="text-base font-semibold text-balance">
              Productos más vendidos
            </h2>
            <Badge variant="outline">{data.bestSellers.length}</Badge>
          </div>
          <Separator className="bg-border/80" />
          {data.bestSellers.length === 0 ? (
            <Empty className="min-h-64 rounded-none border-0 p-0">
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

        <Separator className="bg-border/80 lg:h-full lg:w-px" />

        <div className="min-w-0 space-y-4">
          <div
            className="flex flex-col items-start gap-2 sm:flex-row
              sm:items-center sm:justify-between sm:gap-4"
          >
            <h2 className="text-base font-semibold text-balance">
              Ingresos por tipo de orden
            </h2>
            <Badge variant="outline">{data.revenueByOrderType.length}</Badge>
          </div>
          <Separator className="bg-border/80" />
          <div className="w-full max-w-full overflow-x-auto pb-1">
            <Table className="min-w-[28rem]">
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
                    <TableCell className="text-right tabular-nums">
                      {item.orders}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(item.revenue, data.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </div>
  )
}
