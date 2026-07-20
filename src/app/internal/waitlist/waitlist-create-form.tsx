"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import * as Sentry from "@sentry/nextjs"
import { Plus } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { z } from "zod/v4"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createEnabledWaitlistEntry } from "@/server/actions/internal-admin/mutations"

const schema = z.object({
  email: z.email({ error: "Ingresa un correo electrónico válido" })
})

type FormValues = z.infer<typeof schema>

export function WaitlistCreateForm() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const { execute, isPending, reset } = useAction(createEnabledWaitlistEntry, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
        toast.error(data.failure.reason)
        reset()
        return
      }
      toast.success("Correo agregado a la lista de espera y habilitado")
      setOpen(false)
      form.reset()
      reset()
      router.refresh()
    },
    onError: error => {
      Sentry.captureException(error, {
        tags: { section: "waitlist-create-form" }
      })
      toast.error("Error al agregar el correo")
      reset()
    }
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" }
  })

  const onSubmit = (data: FormValues) => execute(data)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 size-4" />
          Agregar correo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar a lista de espera</DialogTitle>
          <DialogDescription>
            Agrega un correo directamente habilitado para acceder a la
            aplicación.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Field>
              <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
              <Input
                id="email"
                placeholder="correo@ejemplo.com"
                {...form.register("email")}
              />
              <FieldError>{form.formState.errors.email?.message}</FieldError>
            </Field>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isPending}
              >
                Agregar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
