"use client"

import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createVariant } from "@/server/actions/item/mutations"
import { variantSchema } from "@/lib/types"
import { useMobile } from "@/lib/use-mobile"

export function VariantCreate({
  open,
  setOpen,
  menuItemId
}: {
  open: boolean
  setOpen: (open: boolean) => void
  menuItemId: string
}) {
  const isMobile = useMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Variantes</DrawerTitle>
            <DrawerDescription>
              Agrega una variante para mostrar diferentes opciones de un mismo
              producto
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <VariantCreateForm menuItemId={menuItemId} onClose={setOpen} />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Variantes</DialogTitle>
          <DialogDescription>
            Agrega una variante para mostrar diferentes opciones de un mismo
            producto
          </DialogDescription>
        </DialogHeader>
        <VariantCreateForm menuItemId={menuItemId} onClose={setOpen} />
      </DialogContent>
    </Dialog>
  )
}

export function VariantCreateForm({
  menuItemId,
  onClose
}: {
  menuItemId: string
  onClose: (open: boolean) => void
}) {
  const form = useForm<z.infer<typeof variantSchema>>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      name: undefined,
      price: 0,
      menuItemId
    }
  })

  const { execute, status, reset } = useAction(createVariant, {
    onSuccess: data => {
      if (data?.success) {
        onClose(false)
      } else if (data?.failure.reason) {
        toast.error(data?.failure.reason)
      }

      reset()
    },
    onError: () => {
      toast.error("Ocurrió un error")
      reset()
    }
  })

  const onSubmit = async (data: z.infer<typeof variantSchema>) => {
    execute(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  placeholder="Nombre de la variante"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="price">Precio</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="price"
                  type="number"
                  placeholder="Precio"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={status === "executing"} type="submit">
          {status === "executing" ? (
            <>
              <Loader className="mr-2 size-4 animate-spin" />
              {"Creando..."}
            </>
          ) : (
            "Crear variante"
          )}
        </Button>
      </form>
    </Form>
  )
}
