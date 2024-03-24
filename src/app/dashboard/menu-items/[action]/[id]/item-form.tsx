"use client"

import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Prisma } from "@prisma/client"
import { useAction } from "next-safe-action/hooks"
import type { z } from "zod"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { getMenuItemById } from "@/server/actions/item/queries"
import { menuItemSchema } from "@/lib/types"

export default function ItemForm({
  item,
  action
}: {
  item: Prisma.PromiseReturnType<typeof getMenuItemById>
  action: string
}) {
  const form = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: item?.name,
      description: item?.description ?? undefined,
      image: item?.image ?? undefined,
      categoryId: item?.category?.id ?? undefined
    }
  })

  const title = (action === "new" ? "Crear" : "Editar") + " Producto"

  const onSubmit = async (data: z.infer<typeof menuItemSchema>) => {
    console.log(data)
  }

  return (
    <div>
      <PageSubtitle title={title} />
      <Form {...form}>
        <form
          className="mt-10 space-x-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="name">Nombre</FormLabel>
                <FormControl>
                  <Input {...field} id="name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  )
}
