"use client"

import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { DialogTitle } from "@radix-ui/react-dialog"
import { useQueryClient } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import type { z } from "zod/v4"

import { EmptyImageField } from "@/components/dashboard/empty-image-field"
import { FileUploader } from "@/components/dashboard/file-uploader"
import { ImageField } from "@/components/dashboard/image-field"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText
} from "@/components/ui/input-group"
import { Textarea } from "@/components/ui/textarea"
import { updateOrg } from "@/server/actions/organization/mutations"
import type { getCurrentOrganization } from "@/server/actions/user/queries"
import {
  ImageType,
  orgSchema,
  type Plan,
  type SubscriptionStatus
} from "@/lib/types"
import { getInitials } from "@/lib/utils"

export default function OrganizationForm({
  data,
  enabled
}: {
  data: NonNullable<Awaited<ReturnType<typeof getCurrentOrganization>>>
  enabled: boolean
}) {
  const form = useForm<z.infer<typeof orgSchema>>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      id: data.id,
      name: data.name,
      description: data.description ?? undefined,
      slug: data.slug,
      status: data.status as SubscriptionStatus,
      plan: data.plan?.toUpperCase() as Plan
    }
  })

  const router = useRouter()
  const queryClient = useQueryClient()

  const { execute, status, reset } = useAction(updateOrg, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Información actualizada")
        queryClient.invalidateQueries({
          queryKey: ["workgroup", "current"]
        })
      } else if (data?.failure?.reason) {
        toast.error(data.failure.reason)
      }

      reset()
    },
    onError: () => {
      toast.error("No se pudo actualizar la información del negocio")
    }
  })

  const onSubmit = (values: z.infer<typeof orgSchema>) => {
    execute(values)
  }

  // Refresh form when data changes
  useEffect(() => {
    form.reset({
      id: data.id,
      name: data.name,
      description: data.description ?? undefined,
      slug: data.slug,
      status: data.status as SubscriptionStatus,
      plan: data.plan?.toUpperCase() as Plan
    })
  }, [data, form])

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <fieldset disabled={!enabled} className="mt-10 space-y-6">
        <div className="flex items-center gap-x-8">
          <Avatar className="border-border h-24 w-24 rounded-xl border">
            {data.logo && (
              <AvatarImage src={data.logo} className="rounded-xl" />
            )}
            <AvatarFallback className="text-3xl">
              {getInitials(data.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="outline">
                  Cambiar imágen
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Subir imágen</DialogTitle>
                </DialogHeader>
                <FileUploader
                  organizationId={data.id}
                  imageType={ImageType.LOGO}
                  objectId={ImageType.LOGO}
                  limitDimension={500}
                  onUploadSuccess={() => {
                    queryClient.invalidateQueries({
                      queryKey: ["workgroup", "current"]
                    })
                    router.refresh()
                  }}
                />
              </DialogContent>
            </Dialog>
            <p className="mt-2 text-xs">
              Se recomienda un tamaño de 500x500 en formato JPG o PNG.
            </p>
          </div>
        </div>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nombre del negocio</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Nombre del negocio"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Descripción"
              />
              <FieldDescription>
                Escribe una breve descripción de tu negocio
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="slug"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Sitio web</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="tu-sitio"
                  className="pl-1!"
                />
                <InputGroupAddon>
                  <InputGroupText>https://.biztro.co/</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription>
                Este es el nombre de tu sitio web. Cambiarlo puede afectar tu
                SEO
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <div className="space-y-2">
          <FieldLabel>Imágen de portada</FieldLabel>
          {data.banner ? (
            <ImageField
              src={data.banner}
              organizationId={data.id}
              imageType={ImageType.BANNER}
              objectId={ImageType.BANNER}
              onUploadSuccess={() => {
                router.refresh()
              }}
            />
          ) : (
            <EmptyImageField
              organizationId={data.id}
              imageType={ImageType.BANNER}
              objectId={ImageType.BANNER}
              onUploadSuccess={() => {
                router.refresh()
              }}
            />
          )}
          <FieldDescription>
            La imágen de portada se mostrará en tu sitio web de manera
            prominente. Se recomienda un tamaño de 1200x800 en formato JPG.
          </FieldDescription>
        </div>
        <Button disabled={status === "executing"} type="submit">
          {status === "executing" ? (
            <>
              <Loader className="mr-2 size-4 animate-spin" />
              {"Guardando..."}
            </>
          ) : (
            "Guardar"
          )}
        </Button>
      </fieldset>
    </form>
  )
}
