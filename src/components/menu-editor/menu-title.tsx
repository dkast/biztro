"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDown } from "lucide-react"
import { useOptimisticAction } from "next-safe-action/hooks"
import { z } from "zod/v4"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { updateMenuName } from "@/server/actions/menu/mutations"
import type { getMenuById } from "@/server/actions/menu/queries"

const nameSchema = z.object({
  name: z.string().min(1, "El nombre es requerido")
})

export default function MenuTitle({
  menu
}: {
  menu: NonNullable<Awaited<ReturnType<typeof getMenuById>>>
}) {
  const form = useForm<z.infer<typeof nameSchema>>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: menu.name ?? "Sin nombre" },
    mode: "onBlur"
  })
  const [name, setName] = useState(menu.name)
  const { execute, result } = useOptimisticAction(updateMenuName, {
    currentState: { name },
    updateFn: (prev, next) => {
      return { ...prev, name: next.name }
    }
  })

  const onClose = (open: boolean) => {
    if (!open) {
      form.handleSubmit(data => {
        console.log("onClose", form.getValues())
        execute({ id: menu.id, name: data.name })
        setName(data.name)
      })()
    }
  }

  const onSubmit = (data: z.infer<typeof nameSchema>) => {
    setName(data.name)
    // console.log("onSubmit", data)
  }

  return (
    <Popover onOpenChange={open => onClose(open)}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="xs">
          {result.data?.name ?? name}
          <ChevronDown className="ml-1 size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="space-y-2">
        <Form {...form}>
          <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    className="h-8"
                    placeholder="Nombre"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  )
}
