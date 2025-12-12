"use client"

import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import type { z } from "zod/v4"

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
// legacy Form helpers removed in favor of Field primitives
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createVariant } from "@/server/actions/item/mutations"
import { useIsMobile } from "@/hooks/use-mobile"
import { variantSchema } from "@/lib/types"

export function VariantCreate({
  open,
  setOpen,
  menuItemId
}: {
  open: boolean
  setOpen: (open: boolean) => void
  menuItemId: string
}) {
  const isMobile = useIsMobile()

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
  const router = useRouter()

  const { execute, status, reset } = useAction(createVariant, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        router.refresh()
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

  const onSubmit = (data: z.infer<typeof variantSchema>) => {
    // Convert price to number if it's a string
    if (typeof data.price === "string") {
      data.price = parseFloat(data.price)
    }
    execute(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
            <Input
              {...field}
              id={field.name}
              placeholder="Nombre de la variante"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="price"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Precio</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="number"
              inputMode="decimal"
              placeholder="Precio"
              onChange={e => field.onChange(Number(e.target.value))}
              onFocus={e => (e.target as HTMLInputElement).select()}
              value={field.value ?? ""}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
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
  )
}
