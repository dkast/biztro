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
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle
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
      <FieldSet disabled={!enabled} className="mt-10">
        <FieldGroup>
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
                  Nombre de referencia para la sucursal, no será visible para
                  los clientes
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
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
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
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
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
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
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>
      <FieldSet disabled={!enabled} className="mt-10">
        <FieldLegend>Redes sociales y contacto</FieldLegend>
        <FieldDescription>
          Agrega las redes sociales y métodos de contacto de esta sucursal
        </FieldDescription>
        <FieldGroup>
          <Controller
            name="facebook"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field orientation="responsive">
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
                <Input {...field} id={field.name} placeholder="usuario" />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="instagram"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field orientation="responsive">
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
                <Input {...field} id={field.name} placeholder="usuario" />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="twitter"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field orientation="responsive">
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
                <Input {...field} id={field.name} placeholder="usuario" />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="tiktok"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field orientation="responsive">
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
                <Input {...field} id={field.name} placeholder="usuario" />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="whatsapp"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field orientation="responsive">
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
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Número de teléfono"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>
      <FieldSet disabled={!enabled} className="mt-10">
        <FieldLegend>Servicios</FieldLegend>
        <FieldDescription>
          Configura los servicios que ofrece esta sucursal
        </FieldDescription>
        <FieldGroup>
          <Controller
            name="serviceDineIn"
            control={form.control}
            render={({ field }) => (
              <FieldLabel htmlFor={field.name}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Comer aquí</FieldTitle>
                    <FieldDescription>
                      Habilitar consumo en local
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              </FieldLabel>
            )}
          />
          <Controller
            name="serviceTakeout"
            control={form.control}
            render={({ field }) => (
              <FieldLabel htmlFor={field.name}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Para llevar</FieldTitle>
                    <FieldDescription>Habilitar para llevar</FieldDescription>
                  </FieldContent>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              </FieldLabel>
            )}
          />
          <Controller
            name="serviceDelivery"
            control={form.control}
            render={({ field }) => (
              <FieldLabel htmlFor={field.name}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>A domicilio</FieldTitle>
                    <FieldDescription>
                      Habilitar entrega a domicilio
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              </FieldLabel>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="deliveryFee"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Costo de envío a domicilio
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    min={0}
                    onChange={e => field.onChange(Number(e.target.value))}
                    onFocus={e => (e.target as HTMLInputElement).select()}
                    inputMode="decimal"
                  />
                  <FieldDescription>0 = Gratis</FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="currency"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Moneda por defecto
                  </FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={"MXN"}>MXN</SelectItem>
                      <SelectItem value={"USD"}>USD</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>
          <Field orientation="responsive">
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
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  )
}
