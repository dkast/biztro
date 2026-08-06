"use client"

import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import {
  CreditCard,
  LoaderCircle,
  Plus,
  Trash2,
  WalletCards
} from "lucide-react"
import { useAction } from "next-safe-action/hooks"

import { CustomerQuickCreateDialog } from "@/components/customers/customer-quick-create-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { completeSale } from "@/server/actions/sales/mutations"
import { formatPrice, type Currency } from "@/lib/currency"
import type { CustomerOption } from "@/lib/types/customers"
import {
  paymentMethodLabels,
  paymentMethodValues,
  type PaymentMethod
} from "@/lib/types/payments"
import type { SaleCartItemInput, SalesOrderType } from "@/lib/types/sales"

type DraftPayment = {
  id: string
  method: PaymentMethod
  amount: string
}

function newDraftPayment(): DraftPayment {
  return {
    id: crypto.randomUUID(),
    method: "CASH",
    amount: ""
  }
}

function parseAmount(value: string) {
  const normalized = value.replace(",", ".").trim()
  if (!/^\d+(?:\.\d{0,2})?$/.test(normalized)) return null

  const amount = Number(normalized)
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

export function SaleCheckoutDialog({
  open,
  onOpenChange,
  orderType,
  items,
  total,
  currency,
  customers,
  onCompleted
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderType: SalesOrderType
  items: SaleCartItemInput[]
  total: number
  currency: Currency
  customers: CustomerOption[]
  onCompleted: () => void
}) {
  const [payments, setPayments] = useState<DraftPayment[]>([newDraftPayment()])
  const [customerOptions, setCustomerOptions] = useState(customers)
  const [customerId, setCustomerId] = useState("")
  const [acceptsCredit, setAcceptsCredit] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCustomerOptions(customers)
  }, [customers])

  useEffect(() => {
    if (!open) return

    setPayments([newDraftPayment()])
    setCustomerId("")
    setAcceptsCredit(false)
    setError(null)
  }, [open])

  const paid = useMemo(
    () =>
      payments.reduce(
        (sum, payment) => sum + (parseAmount(payment.amount) ?? 0),
        0
      ),
    [payments]
  )
  const balance = Math.max(0, Number((total - paid).toFixed(2)))
  const exceedsTotal = paid > total
  const hasInvalidAmount = payments.some(
    payment => payment.amount.trim() && parseAmount(payment.amount) === null
  )
  const hasCredit = balance > 0

  const { execute, isPending, reset } = useAction(completeSale, {
    onSuccess: ({ data }) => {
      if (data?.failure) {
        setError(data.failure.reason ?? "No se pudo completar la venta")
        reset()
        return
      }

      if (data?.success) {
        toast.success(
          `Venta completada, ${formatPrice(data.success.total, currency)}`
        )
        setPayments([newDraftPayment()])
        setCustomerId("")
        setAcceptsCredit(false)
        setError(null)
        onOpenChange(false)
        onCompleted()
      }

      reset()
    },
    onError: () => {
      setError("No se pudo completar la venta")
      reset()
    }
  })

  const updatePayment = (
    id: string,
    key: keyof Omit<DraftPayment, "id">,
    value: string
  ) => {
    setPayments(current =>
      current.map(payment =>
        payment.id === id ? { ...payment, [key]: value } : payment
      )
    )
  }

  const handleSubmit = () => {
    if (exceedsTotal) {
      setError("Los pagos no pueden superar el total")
      return
    }

    if (hasInvalidAmount) {
      setError("Corrige los montos de pago")
      return
    }

    if (hasCredit && !customerId) {
      setError("Selecciona un cliente para registrar el crédito")
      return
    }

    if (hasCredit && !acceptsCredit) {
      setError("Confirma el saldo a crédito")
      return
    }

    setError(null)
    execute({
      orderType,
      items,
      customerId: customerId || undefined,
      acceptsCredit,
      payments: payments.flatMap(payment => {
        const amount = parseAmount(payment.amount)
        return amount ? [{ method: payment.method, amount }] : []
      })
    })
  }

  const handleClose = (nextOpen: boolean) => {
    if (isPending) return
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Cobrar venta</DialogTitle>
          <DialogDescription>
            Registra uno o más pagos. El saldo restante se conserva como
            crédito.
          </DialogDescription>
        </DialogHeader>

        <div
          className="border-border bg-border grid grid-cols-3 gap-px
            overflow-hidden rounded-lg border"
        >
          <CheckoutMetric label="Total" value={formatPrice(total, currency)} />
          <CheckoutMetric label="Pagado" value={formatPrice(paid, currency)} />
          <CheckoutMetric
            label={hasCredit ? "A crédito" : "Liquidado"}
            value={formatPrice(balance, currency)}
            tone={hasCredit ? "warning" : "success"}
          />
        </div>

        <FieldGroup>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel>Pagos</FieldLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setPayments(current => [...current, newDraftPayment()])
              }
            >
              <Plus data-icon="inline-start" />
              Agregar método
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {payments.map(payment => (
              <div
                key={payment.id}
                className="grid grid-cols-[minmax(0,1fr)_7rem_auto] gap-2"
              >
                <Select
                  value={payment.method}
                  onValueChange={value =>
                    updatePayment(payment.id, "method", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethodValues.map(method => (
                      <SelectItem key={method} value={method}>
                        {paymentMethodLabels[method]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  aria-label={`Monto de ${paymentMethodLabels[payment.method]}`}
                  inputMode="decimal"
                  placeholder="0.00"
                  value={payment.amount}
                  onChange={event =>
                    updatePayment(payment.id, "amount", event.target.value)
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Quitar método de pago"
                  disabled={payments.length === 1}
                  onClick={() =>
                    setPayments(current =>
                      current.filter(
                        currentPayment => currentPayment.id !== payment.id
                      )
                    )
                  }
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>

          {hasCredit && (
            <div className="border-border space-y-4 rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <WalletCards className="text-muted-foreground mt-0.5 size-4" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Saldo a crédito</p>
                  <FieldDescription>
                    Este saldo aparecerá en la cartera del cliente.
                  </FieldDescription>
                </div>
              </div>
              <Field>
                <FieldLabel htmlFor="checkout-customer">Cliente</FieldLabel>
                <div className="flex gap-2">
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger id="checkout-customer" className="w-full">
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customerOptions.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.phone
                            ? `${customer.name}, ${customer.phone}`
                            : customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <CustomerQuickCreateDialog
                    onCreated={customer => {
                      setCustomerOptions(current => [...current, customer])
                      setCustomerId(customer.id)
                    }}
                  />
                </div>
              </Field>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="checkout-credit-confirmation"
                  checked={acceptsCredit}
                  onCheckedChange={value => setAcceptsCredit(value === true)}
                />
                <label
                  htmlFor="checkout-credit-confirmation"
                  className="text-sm leading-snug"
                >
                  Confirmo que {formatPrice(balance, currency)} queda a crédito.
                </label>
              </div>
            </div>
          )}

          {exceedsTotal && (
            <FieldError>
              Los pagos no pueden superar el total de la venta.
            </FieldError>
          )}
          {error && <FieldError>{error}</FieldError>}
        </FieldGroup>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || exceedsTotal || hasInvalidAmount}
          >
            {isPending ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            ) : (
              <CreditCard data-icon="inline-start" />
            )}
            {hasCredit ? "Completar con crédito" : "Completar venta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CheckoutMetric({
  label,
  value,
  tone
}: {
  label: string
  value: string
  tone?: "success" | "warning"
}) {
  return (
    <div className="bg-background flex min-w-0 flex-col gap-1 p-3">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
      {tone && (
        <Badge
          variant={tone === "success" ? "green" : "yellow"}
          className="w-fit"
        >
          {tone === "success" ? "Pagada" : "Pendiente"}
        </Badge>
      )}
    </div>
  )
}
