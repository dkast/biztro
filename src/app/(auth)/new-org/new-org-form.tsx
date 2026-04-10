"use client"

import { useEffect } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import slugify from "@sindresorhus/slugify"
import { useQueryClient } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { type z } from "zod/v4"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText
} from "@/components/ui/input-group"
import { Textarea } from "@/components/ui/textarea"
import { bootstrapOrg } from "@/server/actions/organization/mutations"
import { Plan, SubscriptionStatus } from "@/lib/types/billing"
import { orgSchema } from "@/lib/types/organization"

export type BootstrappedOrganization = {
  id: string
  name: string
  slug: string
  description: string | null
  status: SubscriptionStatus
  plan: Plan
  logo: string | null
  banner: string | null
}

export default function NewOrgForm({
  onSuccess,
  submitLabel,
  redirectTo
}: {
  onSuccess?: (organization: BootstrappedOrganization) => void
  submitLabel?: string
  redirectTo?: string
}) {
  const form = useForm<z.infer<typeof orgSchema>>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: "",
      description: "",
      slug: "",
      status: SubscriptionStatus.ACTIVE,
      plan: Plan.BASIC
    }
  })
  const router = useRouter()

  const slug = useWatch({
    control: form.control,
    name: "name",
    defaultValue: "mi-negocio"
  })
  const queryClient = useQueryClient()

  useEffect(() => {
    form.setValue("slug", slugify(slug))
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  const { execute, status, reset } = useAction(bootstrapOrg, {
    onSuccess: ({ data }) => {
      if (data?.failure) {
        toast.error(data.failure.reason ?? "Ocurrió un error")
        reset()
        return
      } else if (data?.success) {
        queryClient.invalidateQueries({
          queryKey: ["workgroup", "current"]
        })

        if (onSuccess) {
          onSuccess(data.success as BootstrappedOrganization)
        } else {
          router.push(redirectTo ?? "/dashboard")
        }
      }
      reset()
    },
    onError: () => {
      toast.error("No se pudo actualizar la información del negocio")
      reset()
    }
  })

  const onSubmit = (data: z.infer<typeof orgSchema>) => {
    execute(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="min-w-96 shadow-xl">
          <CardHeader>
            <CardTitle>Datos generales</CardTitle>
          </CardHeader>
          <CardContent>
            <fieldset className="space-y-4">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Nombre del negocio
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Nombre del negocio"
                    />
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
                    <Textarea
                      {...field}
                      id={field.name}
                      placeholder="Descripción"
                    />
                    <FieldDescription>
                      Escribe una breve descripción de tu negocio
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="slug"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Sitio web</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText>https://</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="tu-sitio"
                        className="pl-1!"
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>.biztro.co</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      Este será el nombre de tu sitio web
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </fieldset>
          </CardContent>
          <CardFooter>
            <Button
              disabled={status === "executing"}
              type="submit"
              className="w-full"
            >
              {status === "executing" ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                (submitLabel ?? "Continuar")
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
