"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { Loader2, LockKeyhole } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { TextMorph } from "torph/react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet
} from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { saveOrganizationPaymentSettings } from "@/server/actions/organization/mutations"
import type { OrganizationPaymentSettings } from "@/lib/types/payments"

const paymentMethodOptions = [
  { key: "acceptsCash", label: "Efectivo" },
  { key: "acceptsCard", label: "Tarjeta" },
  { key: "acceptsTransfer", label: "Transferencia" },
  { key: "acceptsCodi", label: "CoDi" },
  { key: "acceptsVoucher", label: "Vale" }
] as const satisfies ReadonlyArray<{
  key: keyof Pick<
    OrganizationPaymentSettings,
    | "acceptsCash"
    | "acceptsCard"
    | "acceptsTransfer"
    | "acceptsCodi"
    | "acceptsVoucher"
  >
  label: string
}>

type PaymentMethodKey = (typeof paymentMethodOptions)[number]["key"]

function getAcceptedMethodCount(settings: OrganizationPaymentSettings) {
  return paymentMethodOptions.reduce(
    (count, method) => count + (settings[method.key] ? 1 : 0),
    0
  )
}

export default function PaymentSettingsForm({
  settings,
  canEdit
}: {
  settings: OrganizationPaymentSettings
  canEdit: boolean
}) {
  const router = useRouter()
  const [values, setValues] = useState(settings)
  const [validationError, setValidationError] = useState<string | null>(null)

  const { execute, status, reset } = useAction(
    saveOrganizationPaymentSettings,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success("Configuración de pagos actualizada")
          setValidationError(null)
          router.refresh()
        } else if (data?.failure?.reason) {
          toast.error(data.failure.reason)
        }

        reset()
      },
      onError: () => {
        toast.error("No se pudo actualizar la configuración de pagos")
        reset()
      }
    }
  )

  const isExecuting = status === "executing"
  const acceptedMethodCount = getAcceptedMethodCount(values)

  const updateMethod = (key: PaymentMethodKey, checked: boolean) => {
    setValues(current => ({ ...current, [key]: checked }))
    setValidationError(null)
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (acceptedMethodCount === 0) {
      setValidationError("Selecciona al menos un método de pago")
      return
    }

    setValidationError(null)
    execute(values)
  }

  return (
    <form className="mt-8 flex flex-col gap-6" onSubmit={onSubmit}>
      {!canEdit && (
        <Alert>
          <LockKeyhole />
          <AlertTitle>Configuración de solo lectura</AlertTitle>
          <AlertDescription>
            Solo el propietario del negocio puede cambiar los métodos de pago y
            la política de crédito.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Métodos de pago</CardTitle>
          <CardDescription>
            Estos métodos aparecerán al cobrar una venta o registrar un abono.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldSet disabled={!canEdit || isExecuting}>
            <FieldGroup className="gap-1">
              {paymentMethodOptions.map(method => (
                <Field
                  key={method.key}
                  orientation="horizontal"
                  className="hover:bg-muted/50 rounded-md px-3 py-3
                    transition-colors"
                >
                  <Checkbox
                    id={method.key}
                    checked={values[method.key]}
                    onCheckedChange={checked =>
                      updateMethod(method.key, checked === true)
                    }
                  />
                  <FieldLabel
                    htmlFor={method.key}
                    className="cursor-pointer font-normal"
                  >
                    {method.label}
                  </FieldLabel>
                </Field>
              ))}
            </FieldGroup>
          </FieldSet>
          {validationError && (
            <p className="text-destructive mt-3 text-sm" role="alert">
              {validationError}
            </p>
          )}
          <FieldDescription className="mt-4">
            Mantén activo al menos un método. Los métodos desactivados no
            aparecerán en nuevos cobros, pero permanecen en el historial.
          </FieldDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Crédito y cartera</CardTitle>
          <CardDescription>
            Permite registrar ventas con saldo pendiente y llevar el control de
            abonos por cliente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldSet disabled={!canEdit || isExecuting}>
            <Field
              orientation="horizontal"
              className="items-center justify-between gap-6"
            >
              <FieldContent>
                <FieldLabel htmlFor="credit-enabled" className="font-medium">
                  Ventas a crédito
                </FieldLabel>
                <FieldDescription>
                  El cliente será obligatorio cuando una venta quede pendiente.
                </FieldDescription>
              </FieldContent>
              <Switch
                id="credit-enabled"
                checked={values.creditEnabled}
                onCheckedChange={checked => {
                  setValues(current => ({
                    ...current,
                    creditEnabled: checked
                  }))
                }}
              />
            </Field>
          </FieldSet>
        </CardContent>
        <Separator />
        <CardFooter className="justify-between gap-4 pt-6">
          <p className="text-muted-foreground text-xs">
            Desactivar crédito requiere liquidar primero cualquier saldo
            pendiente.
          </p>
          {canEdit && (
            <Button disabled={isExecuting} type="submit">
              {isExecuting && <Loader2 className="animate-spin" />}
              <TextMorph>{isExecuting ? "Guardando..." : "Guardar"}</TextMorph>
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  )
}
