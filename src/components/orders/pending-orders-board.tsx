"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { Ban, HandCoins, LoaderCircle, ReceiptText } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { TextMorph } from "torph/react"

import { KitchenTicket } from "@/components/kitchen/kitchen-ticket"
import { LiveStatus } from "@/components/orders/live-status"
import { useLiveRefresh } from "@/components/orders/use-live-refresh"
import { SaleCheckoutDialog } from "@/components/sales/sale-checkout-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { cancelOrder } from "@/server/actions/orders/mutations"
import { formatPrice } from "@/lib/currency"
import { formatOrderNumber } from "@/lib/orders"
import type { CustomerOption } from "@/lib/types/customers"
import {
  orderCancelReasonMaxLength,
  type PaymentTiming,
  type PendingOrder,
  type PendingOrdersData
} from "@/lib/types/order"
import type { PaymentMethod } from "@/lib/types/payments"

export function PendingOrdersBoard({
  data,
  customers,
  acceptedMethods,
  creditEnabled,
  paymentTiming
}: {
  data: PendingOrdersData
  customers: CustomerOption[]
  acceptedMethods: PaymentMethod[]
  creditEnabled: boolean
  paymentTiming: PaymentTiming
}) {
  const live = useLiveRefresh(data.serverTime)
  const [checkoutOrder, setCheckoutOrder] = useState<PendingOrder | null>(null)
  const [cancelTarget, setCancelTarget] = useState<PendingOrder | null>(null)

  const readyOrders = data.orders.filter(
    order => order.kitchenStatus === "READY"
  )
  const kitchenOrders = data.orders.filter(
    order => order.kitchenStatus !== "READY"
  )

  return (
    <div className="flex flex-col gap-6">
      <div
        className="flex flex-col gap-3 sm:flex-row sm:items-center
          sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <span
            className="bg-muted flex size-10 items-center justify-center
              rounded-lg"
          >
            <HandCoins aria-hidden className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold">Por cobrar</h1>
            <p className="text-muted-foreground text-sm">
              {data.orders.length === 1
                ? "1 orden sin cobrar"
                : `${data.orders.length} órdenes sin cobrar`}
            </p>
          </div>
        </div>
        <LiveStatus
          state={live.state}
          ageMs={live.ageMs}
          onRetry={live.refresh}
        />
      </div>

      {data.orders.length === 0 ? (
        <Empty className="min-h-80 rounded-xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ReceiptText />
            </EmptyMedia>
            <EmptyTitle>No hay órdenes por cobrar</EmptyTitle>
            <EmptyDescription>
              {paymentTiming === "PAY_ON_DELIVERY" ? (
                "Las órdenes enviadas a cocina sin cobrar aparecerán aquí."
              ) : (
                <>
                  Tu negocio cobra al ordenar. Puedes cambiarlo en{" "}
                  <Link
                    href="/dashboard/settings/payments"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Configuración de pagos
                  </Link>
                  .
                </>
              )}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <OrderSection
            title="Listas para entregar"
            description="Entrégalas y cobra al cliente."
            orders={readyOrders}
            now={live.now}
            disabled={!live.canWrite}
            onCollect={setCheckoutOrder}
            onCancel={setCancelTarget}
          />
          <OrderSection
            title="En cocina"
            description="Se pueden cobrar antes si el cliente lo solicita."
            orders={kitchenOrders}
            now={live.now}
            disabled={!live.canWrite}
            onCollect={setCheckoutOrder}
            onCancel={setCancelTarget}
          />
        </>
      )}

      {checkoutOrder && (
        <SaleCheckoutDialog
          key={checkoutOrder.id}
          open
          onOpenChange={open => {
            if (!open) setCheckoutOrder(null)
          }}
          target={{
            kind: "order",
            orderId: checkoutOrder.id,
            orderNumber: checkoutOrder.number
          }}
          total={checkoutOrder.total}
          currency={checkoutOrder.currency}
          customers={customers}
          acceptedMethods={acceptedMethods}
          creditEnabled={creditEnabled}
          onCompleted={() => setCheckoutOrder(null)}
        />
      )}

      <CancelOrderDialog
        order={cancelTarget}
        onOpenChange={open => {
          if (!open) setCancelTarget(null)
        }}
      />
    </div>
  )
}

function OrderSection({
  title,
  description,
  orders,
  now,
  disabled,
  onCollect,
  onCancel
}: {
  title: string
  description: string
  orders: PendingOrder[]
  now: number
  disabled: boolean
  onCollect: (order: PendingOrder) => void
  onCancel: (order: PendingOrder) => void
}) {
  if (orders.length === 0) return null

  return (
    <section className="flex flex-col gap-3" aria-label={title}>
      <div>
        <h2 className="text-base font-semibold">
          {title}{" "}
          <span className="text-muted-foreground tabular-nums">
            {orders.length}
          </span>
        </h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {orders.map(order => (
          <KitchenTicket
            key={order.id}
            ticket={order}
            now={now}
            fill={false}
            footer={
              <div className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-muted-foreground text-sm">Total</span>
                  <span className="text-xl font-semibold tabular-nums">
                    {formatPrice(order.total, order.currency)}
                  </span>
                </div>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 px-4"
                    disabled={disabled}
                    onClick={() => onCancel(order)}
                  >
                    <Ban data-icon="inline-start" />
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    className="h-12 text-base font-semibold"
                    disabled={disabled}
                    onClick={() => onCollect(order)}
                  >
                    <HandCoins data-icon="inline-start" />
                    Cobrar {formatPrice(order.total, order.currency)}
                  </Button>
                </div>
              </div>
            }
          />
        ))}
      </div>
    </section>
  )
}

function CancelOrderDialog({
  order,
  onOpenChange
}: {
  order: PendingOrder | null
  onOpenChange: (open: boolean) => void
}) {
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)

  const { execute, isPending, reset } = useAction(cancelOrder, {
    onSuccess: ({ data }) => {
      if (data?.failure) {
        setError(data.failure.reason ?? "No se pudo cancelar la orden")
      } else if (order) {
        toast.success(`Orden ${formatOrderNumber(order.number)} cancelada`)
        setReason("")
        setError(null)
        onOpenChange(false)
      }
      reset()
    },
    onError: () => {
      setError("No se pudo cancelar la orden")
      reset()
    }
  })

  const handleOpenChange = (open: boolean) => {
    if (isPending) return
    if (!open) {
      setReason("")
      setError(null)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={Boolean(order)} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          className="flex flex-col gap-5"
          onSubmit={event => {
            event.preventDefault()
            if (!order) return
            if (!reason.trim()) {
              setError("Describe el motivo de la cancelación")
              return
            }
            setError(null)
            execute({ orderId: order.id, reason: reason.trim() })
          }}
        >
          <DialogHeader>
            <DialogTitle>
              Cancelar orden {order ? formatOrderNumber(order.number) : ""}
            </DialogTitle>
            <DialogDescription>
              La orden no se cobrará y cocina recibirá un aviso para detener su
              preparación. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="cancel-order-reason">Motivo</FieldLabel>
            <Textarea
              id="cancel-order-reason"
              value={reason}
              rows={3}
              maxLength={orderCancelReasonMaxLength}
              placeholder="El cliente se retiró, orden duplicada…"
              aria-invalid={Boolean(error)}
              onChange={event => setReason(event.target.value)}
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              disabled={isPending}
              onClick={() => handleOpenChange(false)}
            >
              Volver
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="h-11"
              disabled={isPending}
            >
              {isPending && (
                <LoaderCircle
                  data-icon="inline-start"
                  className="animate-spin"
                />
              )}
              <TextMorph>
                {isPending ? "Cancelando..." : "Cancelar orden"}
              </TextMorph>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
