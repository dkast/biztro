"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { Ban, LoaderCircle } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { voidPayment } from "@/server/actions/payments/mutations"

export function PaymentVoidDialog({
  paymentId,
  allocationCount
}: {
  paymentId: string
  allocationCount: number
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)

  const { execute, isPending, reset } = useAction(voidPayment, {
    onSuccess: ({ data }) => {
      if (data?.failure) {
        setError(data.failure.reason)
        reset()
        return
      }

      if (data?.success) {
        toast.success("Pago anulado")
        setOpen(false)
        setReason("")
        setError(null)
        router.refresh()
      }

      reset()
    },
    onError: () => {
      setError("No se pudo anular el pago")
      reset()
    }
  })

  const handleVoid = () => {
    if (!reason.trim()) {
      setError("Describe el motivo de la anulación")
      return
    }

    setError(null)
    execute({ paymentId, reason })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="ghost" size="xs">
          <Ban data-icon="inline-start" />
          Anular pago
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Anular este pago?</AlertDialogTitle>
          <AlertDialogDescription>
            {allocationCount > 1
              ? `Este movimiento se aplicó a ${allocationCount} ventas. Al anularlo, todas recuperarán su saldo pendiente.`
              : "El movimiento se conservará en el historial como anulado."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor={`payment-void-reason-${paymentId}`}>
            Motivo de anulación
          </FieldLabel>
          <Textarea
            id={`payment-void-reason-${paymentId}`}
            value={reason}
            onChange={event => {
              setReason(event.target.value)
              setError(null)
            }}
            maxLength={500}
            aria-invalid={Boolean(error)}
          />
          {error && <FieldError>{error}</FieldError>}
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={handleVoid}
          >
            {isPending && (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            )}
            Anular pago
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
