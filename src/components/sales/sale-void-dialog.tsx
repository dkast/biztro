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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { voidSale } from "@/server/actions/sales/mutations"
import {
  voidReasonLabels,
  voidReasonValues,
  type VoidReason
} from "@/lib/types/sales"

export function SaleVoidDialog({ saleId }: { saleId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<VoidReason | "">("")
  const [reasonDetail, setReasonDetail] = useState("")
  const [reasonError, setReasonError] = useState<string | null>(null)

  const { execute, isPending, reset } = useAction(voidSale, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
        toast.error(data.failure.reason)
        reset()
        return
      }

      if (data?.success) {
        toast.success("Venta anulada")
        setOpen(false)
        setReason("")
        setReasonDetail("")
        router.refresh()
      }

      reset()
    },
    onError: () => {
      toast.error("No se pudo anular la venta")
      reset()
    }
  })

  const handleVoid = () => {
    if (!reason) {
      setReasonError("Selecciona un motivo")
      return
    }

    if (reason === "OTHER" && !reasonDetail.trim()) {
      setReasonError("Describe el motivo de la anulación")
      return
    }

    setReasonError(null)
    execute({
      saleId,
      reason,
      reasonDetail: reason === "OTHER" ? reasonDetail : undefined
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Ban data-icon="inline-start" />
          Anular venta
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Anular esta venta?</AlertDialogTitle>
          <AlertDialogDescription>
            La venta y sus productos se conservarán para auditoría, pero dejará
            de contar en los ingresos y métricas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <FieldGroup>
          <Field data-invalid={Boolean(reasonError)}>
            <FieldLabel htmlFor="void-reason">Motivo de anulación</FieldLabel>
            <Select
              value={reason}
              onValueChange={value => {
                setReason(value as VoidReason)
                setReasonError(null)
              }}
            >
              <SelectTrigger
                id="void-reason"
                aria-invalid={Boolean(reasonError)}
              >
                <SelectValue placeholder="Selecciona un motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {voidReasonValues.map(value => (
                    <SelectItem key={value} value={value}>
                      {voidReasonLabels[value]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {reasonError && <FieldError>{reasonError}</FieldError>}
          </Field>
          {reason === "OTHER" && (
            <Field data-invalid={Boolean(reasonError)}>
              <FieldLabel htmlFor="void-reason-detail">
                Describe el motivo
              </FieldLabel>
              <Textarea
                id="void-reason-detail"
                value={reasonDetail}
                onChange={event => {
                  setReasonDetail(event.target.value)
                  setReasonError(null)
                }}
                aria-invalid={Boolean(reasonError)}
                maxLength={500}
                placeholder="Agrega el contexto de esta anulación"
              />
              <FieldDescription>Máximo 500 caracteres.</FieldDescription>
            </Field>
          )}
        </FieldGroup>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleVoid}
            disabled={isPending}
          >
            {isPending && (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            )}
            Anular venta
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
