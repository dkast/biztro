"use client"

import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Location } from "@prisma/client"
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
                <FieldContent>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="usuario"
                    className="col-span-2 w-full"
                  />
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
                <FieldContent>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="usuario"
                    className="col-span-2 w-full"
                  />
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
                <FieldContent>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="usuario"
                    className="col-span-2 w-full"
                  />
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
                <FieldContent>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="usuario"
                    className="col-span-2 w-full"
                  />
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
                <FieldContent>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Número de teléfono"
                    className="col-span-2 w-full"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
