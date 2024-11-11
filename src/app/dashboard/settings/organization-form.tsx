"use client"

import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Organization } from "@prisma/client"
import { DialogTitle } from "@radix-ui/react-dialog"
import { useQueryClient } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import type { z } from "zod"

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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateOrg } from "@/server/actions/organization/mutations"
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
  data: Organization
  enabled: boolean
}) {
  const form = useForm<z.infer<typeof orgSchema>>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      id: data.id,
      name: data.name,
      description: data.description ?? undefined,
      subdomain: data.subdomain,
      status: data.status as SubscriptionStatus,
      plan: data.plan as Plan
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset disabled={!enabled} className="mt-10 space-y-6">
          <div className="flex items-center gap-x-8">
            <Avatar className="h-24 w-24 rounded-xl">
              {data.logo && (
                <AvatarImage src={data.logo} className="rounded-xl border" />
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
              <FormDescription className="mt-2 text-xs">
                Se recomienda un tamaño de 500x500 en formato JPG o PNG.
              </FormDescription>
            </div>
          </div>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="name">Nombre del negocio</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="name"
                    placeholder="Nombre del negocio"
                  />
                </FormControl>
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
                  <Textarea
                    {...field}
                    id="description"
                    placeholder="Descripción"
                  />
                </FormControl>
                <FormDescription>
                  Escribe una breve descripción de tu negocio
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subdomain"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="subdomain">Sitio web</FormLabel>
                <FormControl>
                  <div className="flex flex-row items-center">
                    <span className="flex h-10 items-center rounded-md rounded-r-none border border-r-0 bg-gray-50 px-2 text-sm text-gray-500">
                      https://.biztro.co/
                    </span>
                    <Input
                      {...field}
                      id="subdomain"
                      placeholder="Sitio web"
                      className="rounded-l-none"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Este es el nombre de tu sitio web. Cambiarlo puede afectar tu
                  SEO
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-2">
            <FormLabel>Imágen de portada</FormLabel>
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
            <FormDescription>
              La imágen de portada se mostrará en tu sitio web de manera
              prominente. Se recomienda un tamaño de 1200x800 en formato JPG.
            </FormDescription>
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
    </Form>
  )
}
