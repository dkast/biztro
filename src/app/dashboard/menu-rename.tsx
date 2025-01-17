"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Menu } from "@prisma/client"
import { useQueryClient } from "@tanstack/react-query"
import { useOptimisticAction } from "next-safe-action/hooks"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { updateMenuName } from "@/server/actions/menu/mutations"

const nameSchema = z.object({
  name: z.string().min(1, "El nombre es requerido")
})

export function MenuRename({
  menu,
  open,
  setOpen
}: {
  menu: Menu
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const form = useForm<z.infer<typeof nameSchema>>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: menu.name ?? "" }
  })
  const queryClient = useQueryClient()
  const [name, setName] = useState(menu.name)
  const { execute } = useOptimisticAction(updateMenuName, {
    currentState: { name },
    updateFn: (prev, next) => ({ ...prev, name: next.name })
  })

  const onSubmit = (data: z.infer<typeof nameSchema>) => {
    execute({ id: menu.id, name: data.name })
    setName(data.name)
    queryClient.invalidateQueries({
      queryKey: ["menu", menu.id]
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Renombrar menú</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button variant="default" className="w-full" type="submit">
              Guardar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
