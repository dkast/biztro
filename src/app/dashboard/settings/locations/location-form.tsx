"use client"

import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import type { Location } from "@/generated/prisma-client/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Image from "next/image"
import { type z } from "zod/v4"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  createLocation,
  updateLocation
} from "@/server/actions/location/mutations"
import { locationSchema } from "@/lib/types"

export default function LocationForm({
  data,
  enabled
}: {
  data: Location | null
  enabled: boolean
}) {
  const form = useForm<z.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name,
      description: data?.description ?? undefined,
      address: data?.address ?? undefined,
      phone: data?.phone ?? undefined,
      facebook: data?.facebook ?? undefined,
      instagram: data?.instagram ?? undefined,
      twitter: data?.twitter ?? undefined,
      tiktok: data?.tiktok ?? undefined,
      whatsapp: data?.whatsapp ?? undefined,
      website: data?.website ?? undefined,
      serviceDelivery: data?.serviceDelivery ?? false,
      serviceTakeout: data?.serviceTakeout ?? false,
      serviceDineIn: data?.serviceDineIn ?? false,
      deliveryFee: data?.deliveryFee ?? 0,
      currency: (data?.currency as "MXN" | "USD") ?? "MXN",
      organizationId: data?.organizationId ?? undefined
    }
  })

  const {
    execute: executeCreate,
    status: statusCreate,
    reset: resetCreate
  } = useAction(createLocation, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Sucursal actualizada")
        // Reload the form with the latest data
        const result = data?.success
        form.reset({
          id: result.id,
          name: result.name,
          description: result.description ?? undefined,
          address: result.address ?? undefined,
          phone: result.phone ?? undefined,
          facebook: result.facebook ?? undefined,
          instagram: result.instagram ?? undefined,
          twitter: result.twitter ?? undefined,
          tiktok: result.tiktok ?? undefined,
          whatsapp: result.whatsapp ?? undefined,
          website: result.website ?? undefined,
          serviceDelivery: result.serviceDelivery ?? false,
          serviceTakeout: result.serviceTakeout ?? false,
          serviceDineIn: result.serviceDineIn ?? false,
          deliveryFee: result.deliveryFee ?? 0,
          currency: (result.currency as "MXN" | "USD") ?? "MXN",
          organizationId: result.organizationId ?? undefined
        })
      } else if (data?.failure.reason) {
        toast.error(data.failure.reason)
      }

      resetCreate()
    },
    onError: () => {
      toast.error("No se pudo actualizar la sucursal")
    }
  })

  const {
    execute: executeUpdate,
    status: statusUpdate,
    reset: resetUpdate
  } = useAction(updateLocation, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Sucursal actualizada")
      } else if (data?.failure.reason) {
        toast.error(data.failure.reason)
      }
      resetUpdate()
    },
    onError: () => {
      toast.error("No se pudo actualizar la sucursal")
    }
  })

  const onSubmit = (values: z.infer<typeof locationSchema>) => {
    if (data) {
      executeUpdate(values)
    } else {
      executeCreate(values)
    }
  }

  // Refresh form when data changes
  useEffect(() => {
    form.reset({
      id: data?.id,
      name: data?.name,
      description: data?.description ?? undefined,
      address: data?.address ?? undefined,
      phone: data?.phone ?? undefined,
      facebook: data?.facebook ?? undefined,
      instagram: data?.instagram ?? undefined,
      twitter: data?.twitter ?? undefined,
      tiktok: data?.tiktok ?? undefined,
      whatsapp: data?.whatsapp ?? undefined,
      website: data?.website ?? undefined,
      serviceDelivery: data?.serviceDelivery ?? false,
      serviceTakeout: data?.serviceTakeout ?? false,
      serviceDineIn: data?.serviceDineIn ?? false,
      deliveryFee: data?.deliveryFee ?? 0,
      currency: (data?.currency as "MXN" | "USD") ?? "MXN",
      organizationId: data?.organizationId ?? undefined
    })
  }, [data, form])

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <fieldset disabled={!enabled} className="mt-10 space-y-6">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                Nombre de la sucursal
              </FieldLabel>
              <Input {...field} id={field.name} placeholder="Nombre" />
              <FieldDescription>
                Nombre de referencia para la sucursal, no será visible para los
                clientes
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="Descripción (opcional)"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="address"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Dirección</FieldLabel>
              <Input {...field} id={field.name} placeholder="Dirección" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Teléfono</FieldLabel>
              <Input
                type="tel"
                {...field}
                id={field.name}
                className="sm:w-1/2"
                placeholder="Teléfono (opcional)"
              />
              <FieldDescription>
                Número de teléfono de la sucursal sin espacios ni guiones
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <PageSubtitle title="Redes sociales" />
        <div className="flex flex-col gap-4">
          <Controller
            name="facebook"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="grid grid-cols-3 items-center sm:gap-4">
                <FieldLabel
                  htmlFor={field.name}
                  className="flex items-center gap-3"
                >
                  <Image
                    src="/facebook.svg"
                    alt="Facebook"
                    width={24}
                    height={24}
                  />
                  Facebook
                </FieldLabel>
                <FieldContent className="col-span-2 w-full">
                  <Input {...field} id={field.name} placeholder="usuario" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />
          <Controller
            name="instagram"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="grid grid-cols-3 items-center sm:gap-4">
                <FieldLabel
                  htmlFor={field.name}
                  className="flex items-center gap-3"
                >
                  <Image
                    src="/instagram.svg"
                    alt="Instagram"
                    width={24}
                    height={24}
                  />
                  Instagram
                </FieldLabel>
                <FieldContent className="col-span-2 w-full">
                  <Input {...field} id={field.name} placeholder="usuario" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />
          <Controller
            name="twitter"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="grid grid-cols-3 items-center sm:gap-4">
                <FieldLabel
                  htmlFor={field.name}
                  className="flex items-center gap-3"
                >
                  <Image
                    src="/twitter.svg"
                    alt="Twitter"
                    width={24}
                    height={24}
                  />
                  Twitter
                </FieldLabel>
                <FieldContent className="col-span-2 w-full">
                  <Input {...field} id={field.name} placeholder="usuario" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />
          <Controller
            name="tiktok"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="grid grid-cols-3 items-center sm:gap-4">
                <FieldLabel
                  htmlFor={field.name}
                  className="flex items-center gap-3"
                >
                  <Image
                    src="/tiktok.svg"
                    alt="TikTok"
                    width={24}
                    height={24}
                  />
                  TikTok
                </FieldLabel>
                <FieldContent className="col-span-2 w-full">
                  <Input {...field} id={field.name} placeholder="usuario" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />
          <Controller
            name="whatsapp"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="grid grid-cols-3 items-center sm:gap-4">
                <FieldLabel
                  htmlFor={field.name}
                  className="flex items-center gap-3"
                >
                  <Image
                    src="/whatsapp.svg"
                    alt="WhatsApp"
                    width={24}
                    height={24}
                  />
                  WhatsApp
                </FieldLabel>
                <FieldContent className="col-span-2 w-full">
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Número de teléfono"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />
        </div>
        <PageSubtitle title="Servicios" />
        <div className="flex flex-col gap-4">
          <Controller
            name="currency"
            control={form.control}
            render={({ field }) => (
              <Field className="grid grid-cols-3 items-center sm:gap-4">
                <FieldLabel htmlFor={field.name}>Moneda por defecto</FieldLabel>
                <FieldContent className="col-span-2 w-full">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={"MXN"}>MXN</SelectItem>
                      <SelectItem value={"USD"}>USD</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            )}
          />
          <Controller
            name="serviceDelivery"
            control={form.control}
            render={({ field }) => (
              <Field
                className="grid grid-cols-3 items-center sm:gap-4"
                orientation="horizontal"
              >
                <FieldLabel htmlFor={field.name}>Delivery</FieldLabel>
                <FieldContent className="col-span-2 flex w-full items-center justify-between">
                  <FieldDescription>
                    Habilitar entrega a domicilio
                  </FieldDescription>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FieldContent>
              </Field>
            )}
          />
          <Controller
            name="deliveryFee"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="grid grid-cols-3 items-center sm:gap-4">
                <FieldLabel htmlFor={field.name}>Costo de delivery</FieldLabel>
                <FieldContent className="col-span-2 w-full">
                  <Input {...field} id={field.name} type="number" min={0} />
                  <FieldDescription>0 = Gratis</FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />
          <Controller
            name="serviceTakeout"
            control={form.control}
            render={({ field }) => (
              <Field
                className="grid grid-cols-3 items-center sm:gap-4"
                orientation="horizontal"
              >
                <FieldLabel htmlFor={field.name}>Para llevar</FieldLabel>
                <FieldContent className="col-span-2 flex w-full items-center justify-between">
                  <FieldDescription>Habilitar para llevar</FieldDescription>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FieldContent>
              </Field>
            )}
          />
          <Controller
            name="serviceDineIn"
            control={form.control}
            render={({ field }) => (
              <Field
                className="grid grid-cols-3 items-center sm:gap-4"
                orientation="horizontal"
              >
                <FieldLabel htmlFor={field.name}>Comer aquí</FieldLabel>
                <FieldContent className="col-span-2 flex w-full items-center justify-between">
                  <FieldDescription>
                    Habilitar consumo en local
                  </FieldDescription>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FieldContent>
              </Field>
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={
            statusUpdate === "executing" || statusCreate === "executing"
          }
        >
          {statusUpdate === "executing" || statusCreate === "executing" ? (
            <>
              <Loader className="mr-2 size-4 animate-spin" />
              {"Guardando..."}
            </>
          ) : data ? (
            "Actualizar sucursal"
          ) : (
            "Crear sucursal"
          )}
        </Button>
      </fieldset>
    </form>
  )
}
