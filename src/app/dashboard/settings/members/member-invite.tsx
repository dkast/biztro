"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader, UserPlus } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { z } from "zod/v4"

import { UpgradeDialog } from "@/components/dashboard/upgrade-dialog"
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
import { inviteMember } from "@/server/actions/user/mutations"

const emailSchema = z.object({
  email: z.email({
    error: "Por favor, introduce un correo electrónico válido"
  })
})

export default function MemberInvite({ isPro }: { isPro: boolean }) {
  const [open, setOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const { execute, status, reset } = useAction(inviteMember, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
        toast.error(data.failure.reason)
        return
      }
      toast.success("Invitación enviada")
      setOpen(false)
      reset()
    },
    onError: error => {
      Sentry.captureException(error, {
        tags: { action: "invite_member" }
      })
      toast.error("Falló el envío de la invitación")
    }
  })

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" }
  })

  const onSubmit = async (data: z.infer<typeof emailSchema>) => {
    if (!isPro) {
      setUpgradeOpen(true)
      return
    }
    await execute(data)
  }

  return (
    <div>
      {isPro ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="size-4" />
              Invitar miembro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invitar miembro</DialogTitle>
              <DialogDescription>
                Introduce el correo electrónico del miembro que deseas invitar.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-4 space-y-6"
              >
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        {...field}
                        type="email"
                        placeholder="correo@ejemplo.com"
                        className="mb-4"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={status === "executing"}>
                    {status === "executing" ? (
                      <>
                        <Loader className="mr-2 size-4 animate-spin" />
                        {"Enviando..."}
                      </>
                    ) : (
                      "Enviar invitación"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      ) : (
        <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="size-4" />
              Invitar miembro
            </Button>
          </DialogTrigger>
          <UpgradeDialog
            open={upgradeOpen}
            onClose={() => setUpgradeOpen(false)}
            title="Obtén más con el plan Pro"
            description="Actualiza a Pro para colaborar con tu equipo e invitar miembros sin límites."
          />
        </Dialog>
      )}
    </div>
  )
}
