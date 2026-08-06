"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { LoaderCircle, UserPlus } from "lucide-react"
import { useAction } from "next-safe-action/hooks"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createCustomer } from "@/server/actions/customers/mutations"
import type { CustomerOption } from "@/lib/types/customers"

export function CustomerQuickCreateDialog({
  onCreated
}: {
  onCreated: (customer: CustomerOption) => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  const { execute, isPending, reset } = useAction(createCustomer, {
    onSuccess: ({ data }) => {
      if (data?.failure) {
        setError(data.failure.reason)
        reset()
        return
      }

      if (data?.success) {
        onCreated(data.success)
        setOpen(false)
        setName("")
        setPhone("")
        setEmail("")
        setError(null)
        toast.success("Cliente creado")
      }

      reset()
    },
    onError: () => {
      setError("No se pudo crear el cliente")
      reset()
    }
  })

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Ingresa el nombre del cliente")
      return
    }

    setError(null)
    execute({
      name,
      phone: phone || undefined,
      email: email || undefined
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <UserPlus data-icon="inline-start" />
          Nuevo cliente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar cliente</DialogTitle>
          <DialogDescription>
            Crea el cliente y selecciónalo para esta venta.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor="quick-customer-name">Nombre</FieldLabel>
            <Input
              id="quick-customer-name"
              value={name}
              onChange={event => setName(event.target.value)}
              autoFocus
              maxLength={120}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="quick-customer-phone">Teléfono</FieldLabel>
            <Input
              id="quick-customer-phone"
              value={phone}
              onChange={event => setPhone(event.target.value)}
              maxLength={40}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="quick-customer-email">Correo</FieldLabel>
            <Input
              id="quick-customer-email"
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              maxLength={254}
            />
          </Field>
          {error && <FieldError>{error}</FieldError>}
        </FieldGroup>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending && (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            )}
            Crear cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
