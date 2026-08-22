import { Ban, CalendarClock, UserRound } from "lucide-react"

import { PaymentVoidDialog } from "@/components/payments/payment-void-dialog"
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
import { paymentMethodLabels, paymentStatusLabels } from "@/lib/types/payments"
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

function SalePaymentStatusBadge({
  status
}: {
  status: SaleDetail["paymentStatus"]
}) {
  return (
    <Badge
      variant={
        status === "PAID" ? "green" : status === "PARTIAL" ? "yellow" : "blue"
      }
    >
      {paymentStatusLabels[status]}
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
        className="flex flex-col items-center justify-between gap-4 sm:flex-row"
      >
        <div className="flex flex-col gap-2">
          <p className="text-base font-semibold tracking-tight">
            Venta #{sale.id.slice(-8).toUpperCase()}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <SaleStatusBadge status={sale.status} />
            <SalePaymentStatusBadge status={sale.paymentStatus} />
            <Badge
              variant={
                salesOrderTypeBadgeVariants[sale.orderType] as
                  "blue" | "indigo" | "yellow"
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
                    <ItemMedia variant="icon" className="ml-2">
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
                    <ItemActions className="mr-3 font-medium tabular-nums">
                      {formatPrice(item.lineTotal, sale.currency)}
                    </ItemActions>
                  </Item>
                  {index < sale.items.length - 1 && <ItemSeparator />}
                </div>
              ))}
            </ItemGroup>
            <div
              className="bg-muted mt-2 flex items-center justify-between
                rounded-lg px-3 py-2 text-base font-semibold"
            >
              <span>Total</span>
              <span className="tabular-nums">
                {formatPrice(sale.total, sale.currency)}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-muted-foreground">Pagado</p>
                <p className="mt-1 font-semibold tabular-nums">
                  {formatPrice(sale.paidMinor / 100, sale.currency)}
                </p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-muted-foreground">Pendiente</p>
                <p className="mt-1 font-semibold tabular-nums">
                  {formatPrice(sale.balanceMinor / 100, sale.currency)}
                </p>
              </div>
            </div>
            {sale.customer && (
              <p className="text-muted-foreground mt-3 text-sm">
                Cliente:{" "}
                <span className="text-foreground">{sale.customer.name}</span>
              </p>
            )}
          </CardContent>
        </Card>

        <div>
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
              {sale.payments.length > 0 && (
                <div className="border-border border-t pt-4">
                  <p className="mb-3 font-medium">Pagos</p>
                  <div className="flex flex-col gap-3">
                    {sale.payments.map(payment => (
                      <div key={payment.id} className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">
                              {payment.origin === "RECEIVABLE"
                                ? "Abono de cartera"
                                : payment.method === "LEGACY"
                                  ? "Pago histórico"
                                  : paymentMethodLabels[payment.method]}
                            </p>
                            {payment.origin === "RECEIVABLE" && (
                              <p className="text-muted-foreground">
                                {payment.method === "LEGACY"
                                  ? "Pago histórico"
                                  : paymentMethodLabels[payment.method]}
                              </p>
                            )}
                            <p className="text-muted-foreground">
                              {formatDateTime(payment.createdAt)}
                              {payment.createdBy &&
                                ` · ${payment.createdBy.name}`}
                            </p>
                          </div>
                          <span className="font-medium tabular-nums">
                            {formatPrice(
                              payment.allocatedMinor / 100,
                              sale.currency
                            )}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={
                              payment.status === "ACTIVE"
                                ? "green"
                                : "destructive"
                            }
                          >
                            {payment.status === "ACTIVE" ? "Activo" : "Anulado"}
                          </Badge>
                          {payment.allocationCount > 1 && (
                            <Badge variant="secondary">
                              Aplicado a {payment.allocationCount} ventas
                            </Badge>
                          )}
                          {payment.status === "ACTIVE" &&
                            sale.status === "COMPLETED" && (
                              <PaymentVoidDialog
                                paymentId={payment.id}
                                allocationCount={payment.allocationCount}
                              />
                            )}
                        </div>
                        {payment.reference && (
                          <p className="text-muted-foreground">
                            Referencia: {payment.reference}
                          </p>
                        )}
                        {payment.status === "VOID" && payment.voidReason && (
                          <p className="text-muted-foreground">
                            Anulado: {payment.voidReason}
                          </p>
                        )}
                      </div>
                    ))}
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
