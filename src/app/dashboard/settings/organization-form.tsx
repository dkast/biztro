"use client"

import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Organization } from "@prisma/client"
import { useQueryClient } from "@tanstack/react-query"
import { ImageIcon, ImageUp, Loader2 } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import type { z } from "zod"

import { FileUploader } from "@/components/dashboard/file-uploader"
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
import { ImageType, orgSchema, type Plan, type Status } from "@/lib/types"
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
      status: data.status as Status,
      plan: data.plan as Plan
    }
  })

  const router = useRouter()
  const queryClient = useQueryClient()

  const { execute, status, reset } = useAction(updateOrg, {
    onSuccess: data => {
      if (data?.success) {
        toast.success("Información actualizada")
        queryClient.invalidateQueries({
          queryKey: ["workgroup", "current"]
        })
      } else if (data?.failure.reason) {
        toast.error(data.failure.reason)
      }

      reset()
    },
    onError: () => {
      toast.error("No se pudo actualizar la información del negocio")
    }
  })

  const onSubmit = async (values: z.infer<typeof orgSchema>) => {
    console.log(values)
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
                <DialogTrigger>
                  <Button type="button" variant="outline">
                    Cambiar imágen
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>Subir imágen</DialogHeader>
                  <FileUploader
                    organizationId={data.id}
                    imageType={ImageType.LOGO}
                    objectId={ImageType.LOGO}
                    onUploadSuccess={() => {
                      router.refresh()
                    }}
                  />
                </DialogContent>
              </Dialog>
              <p className="mt-2 text-xs leading-5 text-gray-500">
                Se recomienda un tamaño de 400x400 en formato JPG o PNG.
              </p>
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
              <ImageState src={data.banner} organizationId={data.id} />
            ) : (
              <EmptyImageState organizationId={data.id} />
            )}
            <FormDescription>
              La imágen de portada se mostrará en tu sitio web de manera
              prominente
            </FormDescription>
          </div>
          <Button disabled={status === "executing"} type="submit">
            {status === "executing" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

function EmptyImageState({ organizationId }: { organizationId: string }) {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border border-dashed border-gray-300 px-6 py-10">
      <ImageIcon className="size-10 text-gray-300" />
      <Dialog>
        <DialogTrigger>
          <Button type="button" variant="outline" size="sm">
            Subir imágen
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <DialogHeader>Subir imágen</DialogHeader>
          <FileUploader
            organizationId={organizationId}
            imageType={ImageType.BANNER}
            objectId={ImageType.BANNER}
            onUploadSuccess={() => {
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ImageState({
  organizationId,
  src
}: {
  organizationId: string
  src: string
}) {
  const router = useRouter()
  return (
    <div className="group relative h-60 w-full overflow-hidden rounded-lg">
      <img
        src={src}
        alt="Banner"
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 hidden bg-black bg-opacity-50 group-hover:block">
        <div className="absolute inset-0 flex items-center justify-center">
          <Dialog>
            <DialogTrigger>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="border border-white/50 bg-transparent hover:bg-white/10"
              >
                <ImageUp className="mr-2 size-4" />
                Cambiar imágen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>Subir imágen</DialogHeader>
              <FileUploader
                organizationId={organizationId}
                imageType={ImageType.BANNER}
                objectId={ImageType.BANNER}
                onUploadSuccess={() => {
                  router.refresh()
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
