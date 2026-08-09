"use client"

import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import {
  ArrowLeft,
  ArrowRightLeft,
  Banknote,
  CreditCard,
  Landmark,
  LoaderCircle,
  Plus,
  QrCode,
  Split,
  Ticket,
  Trash2,
  WalletCards,
  X,
  type LucideIcon
} from "lucide-react"
import { useAction } from "next-safe-action/hooks"

import { CustomerQuickCreateDialog } from "@/components/customers/customer-quick-create-dialog"
import {
  DialogStack,
  DialogStackBody,
  DialogStackClose,
  DialogStackContent,
  DialogStackDescription,
  DialogStackFooter,
  DialogStackHeader,
  DialogStackNext,
  DialogStackPrevious,
  DialogStackTitle
} from "@/components/kibo-ui/dialog-stack"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { cn } from "@/lib/utils"

type DraftPayment = {
  id: string
  method: PaymentMethod
  amount: string
}

type AdvancedCheckoutMode = "credit" | "split"

type QuickPaymentOption = {
  method: PaymentMethod
  icon: LucideIcon
  description: string
}

const quickPaymentOptions: QuickPaymentOption[] = [
  {
    method: "CASH",
    icon: Banknote,
    description: "Cobrar el total en efectivo"
  },
  {
    method: "CARD",
    icon: CreditCard,
    description: "Cobrar el total con tarjeta"
  },
  {
    method: "TRANSFER",
    icon: Landmark,
    description: "Cobrar el total por transferencia"
  },
  {
    method: "CODI",
    icon: QrCode,
    description: "Cobrar el total con CoDi"
  },
  {
    method: "VOUCHER",
    icon: Ticket,
    description: "Cobrar el total con vale"
  }
]

function newDraftPayment(method: PaymentMethod): DraftPayment {
  return {
    id: crypto.randomUUID(),
    method,
    amount: ""
  }
}

function parseAmountMinor(value: string) {
  const normalized = value.replace(",", ".").trim()
  if (!/^\d+(?:\.\d{0,2})?$/.test(normalized)) return null

  const [wholePart, decimalPart = ""] = normalized.split(".")
  const amountMinor =
    Number(wholePart) * 100 + Number(decimalPart.padEnd(2, "0"))

  return Number.isSafeInteger(amountMinor) && amountMinor > 0
    ? amountMinor
    : null
}

export function SaleCheckoutDialog({
  open,
  onOpenChange,
  orderType,
  items,
  total,
  currency,
  customers,
  acceptedMethods,
  creditEnabled,
  onCompleted
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderType: SalesOrderType
  items: SaleCartItemInput[]
  total: number
  currency: Currency
  customers: CustomerOption[]
  acceptedMethods: PaymentMethod[]
  creditEnabled: boolean
  onCompleted: () => void
}) {
  const defaultPaymentMethod = acceptedMethods[0] ?? "CASH"
  const [activeIndex, setActiveIndex] = useState(0)
  const [advancedMode, setAdvancedMode] =
    useState<AdvancedCheckoutMode>("split")
  const [payments, setPayments] = useState<DraftPayment[]>([
    newDraftPayment(defaultPaymentMethod)
  ])
  const [customerOptions, setCustomerOptions] = useState(customers)
  const [customerId, setCustomerId] = useState("")
  const [acceptsCredit, setAcceptsCredit] = useState(false)
  const [quickMethod, setQuickMethod] = useState<PaymentMethod | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCustomerOptions(customers)
  }, [customers])

  useEffect(() => {
    if (!open) return

    setActiveIndex(0)
    setAdvancedMode("split")
    setPayments([newDraftPayment(defaultPaymentMethod)])
    setCustomerId("")
    setAcceptsCredit(false)
    setQuickMethod(null)
    setError(null)
  }, [defaultPaymentMethod, open])

  const totalMinor = Math.round(total * 100)
  const paidMinor = useMemo(
    () =>
      payments.reduce(
        (sum, payment) => sum + (parseAmountMinor(payment.amount) ?? 0),
        0
      ),
    [payments]
  )
  const balanceMinor =
    advancedMode === "credit" ? totalMinor : Math.max(0, totalMinor - paidMinor)
  const paid = paidMinor / 100
  const balance = balanceMinor / 100
  const exceedsTotal = paidMinor > totalMinor
  const hasInvalidAmount =
    advancedMode === "split" &&
    payments.some(
      payment =>
        payment.amount.trim() && parseAmountMinor(payment.amount) === null
    )
  const hasCredit = balanceMinor > 0

  const resetCheckout = () => {
    setActiveIndex(0)
    setAdvancedMode("split")
    setPayments([newDraftPayment(defaultPaymentMethod)])
    setCustomerId("")
    setAcceptsCredit(false)
    setQuickMethod(null)
    setError(null)
  }

  const { execute, isPending, reset } = useAction(completeSale, {
    onSuccess: ({ data }) => {
      if (data?.failure) {
        setError(data.failure.reason ?? "No se pudo completar la venta")
        setQuickMethod(null)
        reset()
        return
      }

      if (data?.success) {
        toast.success(
          `Venta completada, ${formatPrice(data.success.total, currency)}`
        )
        resetCheckout()
        onOpenChange(false)
        onCompleted()
      }

      reset()
    },
    onError: () => {
      setError("No se pudo completar la venta")
      setQuickMethod(null)
      reset()
    }
  })

  const submitSale = ({
    salePayments,
    saleCustomerId,
    confirmsCredit
  }: {
    salePayments: Array<{ method: PaymentMethod; amount: number }>
    saleCustomerId?: string
    confirmsCredit: boolean
  }) => {
    setError(null)
    execute({
      orderType,
      items,
      customerId: saleCustomerId,
      acceptsCredit: confirmsCredit,
      payments: salePayments
    })
  }

  const handleQuickPayment = (method: PaymentMethod) => {
    setQuickMethod(method)
    submitSale({
      salePayments: total > 0 ? [{ method, amount: total }] : [],
      confirmsCredit: false
    })
  }

  const openAdvancedCheckout = (mode: AdvancedCheckoutMode) => {
    setAdvancedMode(mode)
    setPayments(
      mode === "credit" ? [] : [newDraftPayment(defaultPaymentMethod)]
    )
    setCustomerId("")
    setAcceptsCredit(false)
    setError(null)
  }

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

  const handleAdvancedSubmit = () => {
    if (exceedsTotal) {
      setError("Los pagos no pueden superar el total")
      return
    }

    if (hasInvalidAmount) {
      setError("Corrige los montos de pago")
      return
    }

    if (hasCredit && !creditEnabled) {
      setError("La venta debe quedar liquidada con los métodos aceptados")
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

    submitSale({
      salePayments: payments.flatMap(payment => {
        const amountMinor = parseAmountMinor(payment.amount)
        return amountMinor
          ? [{ method: payment.method, amount: amountMinor / 100 }]
          : []
      }),
      saleCustomerId: customerId || undefined,
      confirmsCredit: acceptsCredit
    })
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return
    if (!nextOpen) resetCheckout()
    onOpenChange(nextOpen)
  }

  return (
    <DialogStack
      open={open}
      onOpenChange={handleOpenChange}
      activeIndex={activeIndex}
      onActiveIndexChange={setActiveIndex}
    >
      <DialogStackBody className="sm:max-w-2xl">
        <DialogStackContent className="p-0">
          <DialogStackClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-4 right-4 z-10"
              aria-label="Cerrar cobro"
              disabled={isPending}
            >
              <X />
            </Button>
          </DialogStackClose>

          <div className="border-border border-b px-5 py-5 pr-14 sm:px-6">
            <DialogStackHeader>
              <DialogStackTitle>¿Cómo pagará el cliente?</DialogStackTitle>
              <DialogStackDescription>
                Selecciona un método para cobrar el total de la venta.
              </DialogStackDescription>
            </DialogStackHeader>
            <div className="mt-5 flex items-baseline justify-between gap-4">
              <span className="text-muted-foreground text-sm">
                Total a cobrar
              </span>
              <span
                className="text-2xl font-semibold tracking-tight tabular-nums"
              >
                {formatPrice(total, currency)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 sm:p-6">
            {quickPaymentOptions
              .filter(option => acceptedMethods.includes(option.method))
              .map(option => (
                <QuickPaymentButton
                  key={option.method}
                  option={option}
                  total={total}
                  currency={currency}
                  isPending={isPending}
                  isSelected={quickMethod === option.method}
                  onClick={() => handleQuickPayment(option.method)}
                />
              ))}

            {creditEnabled && (
              <DialogStackNext asChild>
                <button
                  type="button"
                  className={cn(
                    `border-border hover:bg-accent focus-visible:ring-ring group
                    flex min-h-28 flex-col items-start justify-between
                    rounded-lg border p-4 text-left transition-colors
                    focus-visible:ring-2 focus-visible:ring-offset-2
                    focus-visible:outline-none disabled:pointer-events-none
                    disabled:opacity-50`,
                    "bg-muted/30"
                  )}
                  disabled={isPending || total === 0}
                  onClick={() => openAdvancedCheckout("credit")}
                >
                  <WalletCards
                    aria-hidden
                    className="text-muted-foreground group-hover:text-foreground
                      size-5 transition-colors"
                  />
                  <span>
                    <span className="block text-sm font-semibold">Crédito</span>
                    <span className="text-muted-foreground mt-0.5 block text-xs">
                      Enviar todo a cartera
                    </span>
                  </span>
                </button>
              </DialogStackNext>
            )}

            <DialogStackNext asChild>
              <button
                type="button"
                className="border-border hover:bg-accent focus-visible:ring-ring
                  group col-span-2 flex min-h-20 items-center gap-4 rounded-lg
                  border p-4 text-left transition-colors focus-visible:ring-2
                  focus-visible:ring-offset-2 focus-visible:outline-none
                  disabled:pointer-events-none disabled:opacity-50
                  sm:col-span-3"
                disabled={isPending}
                onClick={() => openAdvancedCheckout("split")}
              >
                <span
                  className="bg-muted flex size-10 shrink-0 items-center
                    justify-center rounded-lg"
                >
                  <Split aria-hidden className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    Dividir pago
                  </span>
                  <span className="text-muted-foreground mt-0.5 block text-xs">
                    Combinar métodos o dejar una parte a crédito
                  </span>
                </span>
                <ArrowRightLeft
                  aria-hidden
                  className="text-muted-foreground size-4"
                />
              </button>
            </DialogStackNext>
          </div>

          {error && activeIndex === 0 && (
            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              <FieldError>{error}</FieldError>
            </div>
          )}
        </DialogStackContent>

        <DialogStackContent className="max-h-[90vh] overflow-y-auto">
          <DialogStackHeader>
            <DialogStackTitle>
              {advancedMode === "credit" ? "Venta a crédito" : "Dividir pago"}
            </DialogStackTitle>
            <DialogStackDescription>
              {advancedMode === "credit"
                ? "Selecciona el cliente que conservará el saldo pendiente."
                : "Combina métodos de pago y, si hace falta, deja el resto a crédito."}
            </DialogStackDescription>
          </DialogStackHeader>

          <div
            className="border-border bg-border mt-5 grid grid-cols-3 gap-px
              overflow-hidden rounded-lg border"
          >
            <CheckoutMetric
              label="Total"
              value={formatPrice(total, currency)}
            />
            <CheckoutMetric
              label="Pagado"
              value={formatPrice(paid, currency)}
            />
            <CheckoutMetric
              label={hasCredit ? "A crédito" : "Liquidado"}
              value={formatPrice(balance, currency)}
              tone={hasCredit ? "warning" : "success"}
            />
          </div>

          <FieldGroup className="mt-6">
            {advancedMode === "split" && (
              <>
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel>Pagos</FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPayments(current => [
                        ...current,
                        newDraftPayment(defaultPaymentMethod)
                      ])
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
                          {paymentMethodValues
                            .filter(method => acceptedMethods.includes(method))
                            .map(method => (
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
                          updatePayment(
                            payment.id,
                            "amount",
                            event.target.value
                          )
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
              </>
            )}

            {hasCredit && creditEnabled && (
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
                    Confirmo que {formatPrice(balance, currency)} queda a
                    crédito.
                  </label>
                </div>
              </div>
            )}

            {exceedsTotal && (
              <FieldError>
                Los pagos no pueden superar el total de la venta.
              </FieldError>
            )}
            {hasCredit && !creditEnabled && (
              <FieldError>
                Esta venta debe quedar liquidada con los métodos aceptados.
              </FieldError>
            )}
            {error && activeIndex === 1 && <FieldError>{error}</FieldError>}
          </FieldGroup>

          <DialogStackFooter>
            <DialogStackPrevious asChild disabled={isPending}>
              <Button type="button" variant="outline">
                <ArrowLeft data-icon="inline-start" />
                Volver
              </Button>
            </DialogStackPrevious>
            <Button
              type="button"
              onClick={handleAdvancedSubmit}
              disabled={
                isPending ||
                exceedsTotal ||
                hasInvalidAmount ||
                (hasCredit && !creditEnabled)
              }
            >
              {isPending ? (
                <LoaderCircle
                  data-icon="inline-start"
                  className="animate-spin"
                />
              ) : advancedMode === "credit" ? (
                <WalletCards data-icon="inline-start" />
              ) : (
                <CreditCard data-icon="inline-start" />
              )}
              {advancedMode === "credit"
                ? "Completar a crédito"
                : hasCredit
                  ? "Completar con crédito"
                  : "Completar venta"}
            </Button>
          </DialogStackFooter>
        </DialogStackContent>
      </DialogStackBody>
    </DialogStack>
  )
}

function QuickPaymentButton({
  option,
  total,
  currency,
  isPending,
  isSelected,
  onClick
}: {
  option: QuickPaymentOption
  total: number
  currency: Currency
  isPending: boolean
  isSelected: boolean
  onClick: () => void
}) {
  const Icon = option.icon

  return (
    <button
      type="button"
      className="border-border hover:bg-accent focus-visible:ring-ring group
        relative flex min-h-28 flex-col items-start justify-between rounded-lg
        border p-4 text-left transition-colors focus-visible:ring-2
        focus-visible:ring-offset-2 focus-visible:outline-none
        disabled:pointer-events-none disabled:opacity-50"
      disabled={isPending}
      aria-label={`${option.description}, ${formatPrice(total, currency)}`}
      onClick={onClick}
    >
      {isSelected ? (
        <LoaderCircle
          aria-hidden
          className="text-primary size-5 animate-spin"
        />
      ) : (
        <Icon
          aria-hidden
          className="text-muted-foreground group-hover:text-foreground size-5
            transition-colors"
        />
      )}
      <span>
        <span className="block text-sm font-semibold">
          {paymentMethodLabels[option.method]}
        </span>
        <span
          className="text-muted-foreground mt-0.5 block text-xs tabular-nums"
        >
          {formatPrice(total, currency)}
        </span>
      </span>
    </button>
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
