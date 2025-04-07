"use client"

import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Location } from "@prisma/client"
import { Loader } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Image from "next/image"
import type { z } from "zod"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset disabled={!enabled} className="mt-10 space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="name">Nombre de la sucursal</FormLabel>
                <FormControl>
                  <Input {...field} id="name" placeholder="Nombre" />
                </FormControl>
                <FormDescription>
                  Nombre de referencia para la sucursal, no será visible para
                  los clientes
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="description">Descripción</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="description"
                    placeholder="Descripción (opcional)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="address">Dirección</FormLabel>
                <FormControl>
                  <Input {...field} id="address" placeholder="Dirección" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="phone">Teléfono</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    {...field}
                    id="phone"
                    className="sm:w-1/2"
                    placeholder="Teléfono"
                  />
                </FormControl>
                <FormDescription>
                  Número de teléfono de la sucursal sin espacios ni guiones
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <PageSubtitle title="Redes sociales" />
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="facebook"
              render={({ field }) => (
                <FormItem className="grid grid-cols-3 items-center sm:gap-4">
                  <FormLabel
                    htmlFor="facebook"
                    className="flex items-center gap-3"
                  >
                    <Image
                      src="/facebook.svg"
                      alt="Facebook"
                      width={24}
                      height={24}
                    />
                    Facebook
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="facebook"
                      placeholder="usuario"
                      className="col-span-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem className="grid grid-cols-3 items-center sm:gap-4">
                  <FormLabel
                    htmlFor="instagram"
                    className="flex items-center gap-3"
                  >
                    <Image
                      src="/instagram.svg"
                      alt="Instagram"
                      width={24}
                      height={24}
                    />
                    Instagram
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="instagram"
                      placeholder="usuario"
                      className="col-span-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="twitter"
              render={({ field }) => (
                <FormItem className="grid grid-cols-3 items-center sm:gap-4">
                  <FormLabel
                    htmlFor="twitter"
                    className="flex items-center gap-3"
                  >
                    <Image
                      src="/twitter.svg"
                      alt="Twitter"
                      width={24}
                      height={24}
                    />
                    Twitter
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="twitter"
                      placeholder="usuario"
                      className="col-span-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tiktok"
              render={({ field }) => (
                <FormItem className="grid grid-cols-3 items-center sm:gap-4">
                  <FormLabel
                    htmlFor="tiktok"
                    className="flex items-center gap-3"
                  >
                    <Image
                      src="/tiktok.svg"
                      alt="TikTok"
                      width={24}
                      height={24}
                    />
                    TikTok
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="tiktok"
                      placeholder="usuario"
                      className="col-span-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem className="grid grid-cols-3 items-center sm:gap-4">
                  <FormLabel
                    htmlFor="whatsapp"
                    className="flex items-center gap-3"
                  >
                    <Image
                      src="/whatsapp.svg"
                      alt="WhatsApp"
                      width={24}
                      height={24}
                    />
                    WhatsApp
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="whatsapp"
                      placeholder="Número de teléfono"
                      className="col-span-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
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
    </Form>
  )
}
