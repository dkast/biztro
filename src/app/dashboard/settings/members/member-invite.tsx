"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader, UserPlus } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { inviteMember } from "@/server/actions/user/mutations"

const emailSchema = z.object({
  email: z.string().email()
})

export default function MemberInvite() {
  const [open, setOpen] = useState(false)
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
      console.error(error)
      toast.error("Falló el envío de la invitación")
    }
  })

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" }
  })

  const onSubmit = async (data: z.infer<typeof emailSchema>) => {
    await execute(data)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <UserPlus className="size-4" />
            Invitar miembro
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Invitar miembro</DialogTitle>
          <DialogDescription>
            Introduce el correo electrónico del miembro que deseas invitar.
          </DialogDescription>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-4 space-y-6"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name}>Email</FormLabel>
                    <Input
                      {...field}
                      type="email"
                      placeholder="correo@ejemplo.com"
                      className="mb-4"
                    />
                  </FormItem>
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
    </>
  )
}
