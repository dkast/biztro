"use client"

import { useMemo, useState } from "react"
import toast from "react-hot-toast"
import { Edit3, LoaderCircle, PlusCircle } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"

import { PaymentVoidDialog } from "@/components/payments/payment-void-dialog"
import { Badge } from "@/components/ui/badge"
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
  Field,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { updateCustomer } from "@/server/actions/customers/mutations"
import { registerCustomerPayment } from "@/server/actions/payments/mutations"
import { formatPrice } from "@/lib/currency"
import { allocatePaymentFIFO } from "@/lib/payments"
import type {
  CustomerReceivablesDetail,
  ReceivableCurrencySummary
} from "@/lib/types/customers"
import {
  paymentMethodLabels,
  paymentMethodValues,
  type PaymentMethod
} from "@/lib/types/payments"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

export function CustomerReceivablesDetailView({
  detail
}: {
  detail: CustomerReceivablesDetail
}) {
  return (
    <div className="flex flex-col gap-6">
      <section
        className="border-border flex flex-col gap-4 rounded-lg border p-5
          sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <p className="text-lg font-semibold">{detail.customer.name}</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {[detail.customer.phone, detail.customer.email]
              .filter(Boolean)
              .join(" · ") || "Sin datos de contacto"}
          </p>
          {detail.customer.notes && (
            <p className="text-muted-foreground mt-3 text-sm">
              {detail.customer.notes}
            </p>
          )}
        </div>
        <CustomerEditDialog customer={detail.customer} />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {detail.summaries.map(summary => (
          <BalanceSummary key={summary.currency} summary={summary} />
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Ventas abiertas</h2>
            <p className="text-muted-foreground text-sm">
              Los abonos se aplican primero a las ventas más antiguas.
            </p>
          </div>
          <RegisterPaymentDialog detail={detail} />
        </div>
        <div className="border-border overflow-x-auto rounded-lg border">
          <Table className="min-w-[36rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Venta</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Pagado</TableHead>
                <TableHead className="text-right">Pendiente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.openSales.map(sale => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">
                    #{sale.id.slice(-8).toUpperCase()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(sale.createdAt)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPrice(sale.totalMinor / 100, sale.currency)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPrice(sale.paidMinor / 100, sale.currency)}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatPrice(sale.balanceMinor / 100, sale.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold">Historial de pagos</h2>
          <p className="text-muted-foreground text-sm">
            Los movimientos se conservan, incluso cuando se anulan.
          </p>
        </div>
        <div className="border-border overflow-x-auto rounded-lg border">
          <Table className="min-w-[38rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.payments.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDate(payment.createdAt)}
                  </TableCell>
                  <TableCell>
                    {payment.method === "LEGACY"
                      ? "Pago histórico"
                      : paymentMethodLabels[payment.method]}
                    {payment.allocationCount > 1 && (
                      <span className="text-muted-foreground block text-xs">
                        {payment.allocationCount} ventas
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.reference ?? "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatPrice(payment.amountMinor / 100, payment.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === "ACTIVE" ? "green" : "destructive"
                      }
                    >
                      {payment.status === "ACTIVE" ? "Activo" : "Anulado"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {payment.status === "ACTIVE" && (
                      <PaymentVoidDialog
                        paymentId={payment.id}
                        allocationCount={payment.allocationCount}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}

function BalanceSummary({ summary }: { summary: ReceivableCurrencySummary }) {
  return (
    <div className="border-border rounded-lg border p-5">
      <p className="text-muted-foreground text-sm">
        Saldo pendiente · {summary.currency}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">
        {formatPrice(summary.balanceMinor / 100, summary.currency)}
      </p>
      <p className="text-muted-foreground mt-1 text-sm">
        {summary.openSales}{" "}
        {summary.openSales === 1 ? "venta abierta" : "ventas abiertas"}
      </p>
    </div>
  )
}

function CustomerEditDialog({
  customer
}: {
  customer: CustomerReceivablesDetail["customer"]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(customer.name)
  const [phone, setPhone] = useState(customer.phone ?? "")
  const [email, setEmail] = useState(customer.email ?? "")
  const [notes, setNotes] = useState(customer.notes ?? "")
  const [error, setError] = useState<string | null>(null)
  const { execute, isPending, reset } = useAction(updateCustomer, {
    onSuccess: ({ data }) => {
      if (data?.failure) {
        setError(data.failure.reason ?? "No se pudo actualizar el cliente")
        reset()
        return
      }

      if (data?.success) {
        setOpen(false)
        toast.success("Cliente actualizado")
        router.refresh()
      }

      reset()
    },
    onError: () => {
      setError("No se pudo actualizar el cliente")
      reset()
    }
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Edit3 data-icon="inline-start" />
        Editar cliente
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
          <DialogDescription>
            Actualiza sus datos de contacto.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="customer-name">Nombre</FieldLabel>
            <Input
              id="customer-name"
              value={name}
              onChange={event => setName(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="customer-phone">Teléfono</FieldLabel>
            <Input
              id="customer-phone"
              value={phone}
              onChange={event => setPhone(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="customer-email">Correo</FieldLabel>
            <Input
              id="customer-email"
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="customer-notes">Notas</FieldLabel>
            <Textarea
              id="customer-notes"
              value={notes}
              onChange={event => setNotes(event.target.value)}
              maxLength={500}
            />
          </Field>
          {error && <FieldError>{error}</FieldError>}
        </FieldGroup>
        <DialogFooter>
          <Button
            type="button"
            disabled={isPending}
            onClick={() => {
              setError(null)
              execute({
                customerId: customer.id,
                name,
                phone: phone || undefined,
                email: email || undefined,
                notes: notes || undefined
              })
            }}
          >
            {isPending && (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            )}
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RegisterPaymentDialog({
  detail
}: {
  detail: CustomerReceivablesDetail
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [currency, setCurrency] = useState(
    detail.summaries[0]?.currency ?? "MXN"
  )
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState<PaymentMethod>("CASH")
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const currentSales = detail.openSales.filter(
    sale => sale.currency === currency
  )
  const amountMinor = /^\d+(?:[.,]\d{1,2})?$/.test(amount.trim())
    ? Math.round(Number(amount.replace(",", ".")) * 100)
    : 0
  const allocationPreview = useMemo(() => {
    try {
      return allocatePaymentFIFO(currentSales, amountMinor)
    } catch {
      return null
    }
  }, [amountMinor, currentSales])
  const { execute, isPending, reset } = useAction(registerCustomerPayment, {
    onSuccess: ({ data }) => {
      if (data?.failure) {
        setError(data.failure.reason ?? "No se pudo registrar el abono")
        reset()
        return
      }
      if (data?.success) {
        toast.success("Abono registrado")
        setOpen(false)
        setAmount("")
        setReference("")
        setNotes("")
        router.refresh()
      }
      reset()
    },
    onError: () => {
      setError("No se pudo registrar el abono")
      reset()
    }
  })

  const handleSubmit = () => {
    if (amountMinor <= 0 || !allocationPreview) {
      setError("Ingresa un monto que no supere el saldo pendiente")
      return
    }
    setError(null)
    execute({
      customerId: detail.customer.id,
      currency,
      amount: amountMinor / 100,
      method,
      reference: reference || undefined,
      notes: notes || undefined
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" onClick={() => setOpen(true)}>
        <PlusCircle data-icon="inline-start" />
        Registrar abono
      </Button>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar abono</DialogTitle>
          <DialogDescription>
            El pago se distribuirá automáticamente en orden de antigüedad.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>Moneda</FieldLabel>
            <Select
              value={currency}
              onValueChange={value => setCurrency(value as "MXN" | "USD")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {detail.summaries.map(summary => (
                  <SelectItem key={summary.currency} value={summary.currency}>
                    {summary.currency} ·{" "}
                    {formatPrice(summary.balanceMinor / 100, summary.currency)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="receivable-amount">Monto</FieldLabel>
            <Input
              id="receivable-amount"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={event => setAmount(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Método</FieldLabel>
            <Select
              value={method}
              onValueChange={value => setMethod(value as PaymentMethod)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethodValues.map(value => (
                  <SelectItem key={value} value={value}>
                    {paymentMethodLabels[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="receivable-reference">
              Referencia (opcional)
            </FieldLabel>
            <Input
              id="receivable-reference"
              value={reference}
              onChange={event => setReference(event.target.value)}
              maxLength={120}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="receivable-notes">Notas (opcional)</FieldLabel>
            <Textarea
              id="receivable-notes"
              value={notes}
              onChange={event => setNotes(event.target.value)}
              maxLength={500}
            />
          </Field>

          {allocationPreview && allocationPreview.length > 0 && (
            <div className="border-border rounded-lg border p-4">
              <p className="text-sm font-medium">Vista previa de aplicación</p>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                {allocationPreview.map(allocation => {
                  const sale = currentSales.find(
                    item => item.id === allocation.saleId
                  )
                  if (!sale) return null
                  return (
                    <div
                      key={allocation.saleId}
                      className="flex justify-between gap-3"
                    >
                      <span>#{sale.id.slice(-8).toUpperCase()}</span>
                      <span className="tabular-nums">
                        {formatPrice(allocation.amountMinor / 100, currency)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {error && <FieldError>{error}</FieldError>}
        </FieldGroup>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending && (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            )}
            Registrar abono
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
