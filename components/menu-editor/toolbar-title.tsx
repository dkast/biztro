"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Menu } from "@prisma/client"
import { ChevronDown } from "lucide-react"
import { useOptimisticAction } from "next-safe-action/hooks"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { updateMenuName } from "@/server/actions/menu/mutations"

const nameSchema = z.object({
  name: z.string().min(1, "El nombre es requerido")
})

export default function ToolbarTitle({ menu }: { menu: Menu }) {
  const form = useForm<z.infer<typeof nameSchema>>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: menu.name },
    mode: "onBlur"
  })
  const [name, setName] = useState(menu.name)
  const { execute, result, optimisticData } = useOptimisticAction(
    updateMenuName,
    { name },
    (state, input) => ({ name: input.name })
  )

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
          {optimisticData?.name ?? name}
          <ChevronDown className="ml-1 size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="space-y-2">
        <Form {...form}>
          <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Nombre</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="name"
                      className="h-8"
                      placeholder="Nombre"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  )
}
