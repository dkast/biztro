import { Ban, CalendarClock, UserRound } from "lucide-react"

import { SaleVoidDialog } from "@/components/sales/sale-void-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle
} from "@/components/ui/item"
import { formatPrice } from "@/lib/currency"
import {
  salesOrderTypeBadgeVariants,
  salesOrderTypeLabels,
  saleStatusLabels,
  type SaleDetail
} from "@/lib/types/sales"

function formatDateTime(value: string | null) {
  if (!value) return "No disponible"

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

function SaleStatusBadge({ status }: { status: SaleDetail["status"] }) {
  return (
    <Badge variant={status === "VOID" ? "destructive" : "green"}>
      {saleStatusLabels[status]}
    </Badge>
  )
}

export function SaleDetailView({ sale }: { sale: SaleDetail }) {
  return (
    <div
      className="@container/sale-detail flex flex-col gap-5 pb-4
        @3xl/sale-detail:gap-6"
    >
      <div
        className="flex flex-col justify-between gap-4 sm:flex-row
          sm:items-start"
      >
        <div className="flex flex-col gap-2">
          <p className="text-base font-semibold tracking-tight">
            Venta #{sale.id.slice(-8).toUpperCase()}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <SaleStatusBadge status={sale.status} />
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
          </div>
        </div>
        {sale.status === "COMPLETED" && <SaleVoidDialog saleId={sale.id} />}
      </div>

      <div
        className="grid gap-5 @3xl/sale-detail:grid-cols-[minmax(0,1fr)_22rem]
          @3xl/sale-detail:gap-6"
      >
        <Card className="bg-background">
          <CardHeader className="gap-0 space-y-0 px-5 py-4 @3xl/sale-detail:p-6">
            <CardTitle className="text-base">Productos</CardTitle>
          </CardHeader>
          <CardContent
            className="px-5 pb-5 @3xl/sale-detail:p-6 @3xl/sale-detail:pt-0"
          >
            <ItemGroup className="gap-0">
              {sale.items.map((item, index) => (
                <div key={item.id}>
                  <Item className="rounded-none px-0 py-3">
                    <ItemMedia variant="icon">
                      <span className="text-sm font-semibold tabular-nums">
                        {item.quantity}x
                      </span>
                    </ItemMedia>
                    <ItemContent className="min-w-0">
                      <ItemTitle>{item.productName}</ItemTitle>
                      {item.variantName && (
                        <p className="text-muted-foreground text-sm">
                          {item.variantName} ·{" "}
                          {formatPrice(item.unitPrice, sale.currency)}
                        </p>
                      )}
                    </ItemContent>
                    <ItemActions className="font-medium tabular-nums">
                      {formatPrice(item.lineTotal, sale.currency)}
                    </ItemActions>
                  </Item>
                  {index < sale.items.length - 1 && <ItemSeparator />}
                </div>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-5 @3xl/sale-detail:gap-6">
          <Card className="bg-background">
            <CardHeader
              className="gap-0 space-y-0 px-5 py-4 @3xl/sale-detail:p-6"
            >
              <CardTitle className="text-base">Totales</CardTitle>
            </CardHeader>
            <CardContent
              className="flex items-center justify-between px-5 pb-5 text-base
                font-semibold @3xl/sale-detail:p-6 @3xl/sale-detail:pt-0"
            >
              <span>Total</span>
              <span className="tabular-nums">
                {formatPrice(sale.total, sale.currency)}
              </span>
            </CardContent>
          </Card>

          <Card className="bg-background">
            <CardHeader
              className="gap-0 space-y-0 px-5 py-4 @3xl/sale-detail:p-6"
            >
              <CardTitle className="text-base">Historial</CardTitle>
            </CardHeader>
            <CardContent
              className="flex flex-col gap-4 px-5 pb-5 text-sm
                @3xl/sale-detail:p-6 @3xl/sale-detail:pt-0"
            >
              <div className="flex items-start gap-3">
                <CalendarClock
                  className="text-muted-foreground mt-0.5 size-4 shrink-0"
                />
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="font-medium">Registrada</p>
                  <p className="text-muted-foreground">
                    {formatDateTime(sale.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserRound
                  className="text-muted-foreground mt-0.5 size-4 shrink-0"
                />
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="font-medium">
                    {sale.completedBy
                      ? "Completada por"
                      : "Completada automáticamente"}
                  </p>
                  <p className="text-muted-foreground">
                    {sale.completedBy?.name ??
                      (sale.completedAt
                        ? formatDateTime(sale.completedAt)
                        : "Sin fecha registrada")}
                    {sale.completedBy &&
                      sale.completedAt &&
                      ` · ${formatDateTime(sale.completedAt)}`}
                  </p>
                </div>
              </div>
              {sale.status === "VOID" && (
                <div className="flex items-start gap-3">
                  <Ban className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="font-medium">Anulada</p>
                    <p className="text-muted-foreground">
                      {sale.voidReason ?? "Sin motivo registrado"}
                    </p>
                    <p className="text-muted-foreground">
                      {sale.voidedBy
                        ? `Anulada por ${sale.voidedBy.name}`
                        : "Anulada automáticamente"}
                      {sale.voidedAt && ` · ${formatDateTime(sale.voidedAt)}`}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
