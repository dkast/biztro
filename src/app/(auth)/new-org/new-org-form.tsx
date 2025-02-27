"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import slugify from "@sindresorhus/slugify"
import confetti from "canvas-confetti"
import { Loader } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
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
import { bootstrapOrg } from "@/server/actions/organization/mutations"
import { orgSchema, Plan, SubscriptionStatus } from "@/lib/types"

export default function NewOrgForm() {
  useEffect(() => {
    confetti({
      particleCount: 200,
      spread: 180,
      origin: { y: 0.1 },
      ticks: 150
    })
  }, [])

  const form = useForm<z.infer<typeof orgSchema>>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: "",
      description: "",
      subdomain: "",
      status: SubscriptionStatus.ACTIVE,
      plan: Plan.BASIC
    }
  })
  const router = useRouter()

  const subdomain = form.watch("name", "mi-negocio")

  useEffect(() => {
    form.setValue("subdomain", slugify(subdomain))
  }, [subdomain]) // eslint-disable-line react-hooks/exhaustive-deps

  const { execute, status, reset } = useAction(bootstrapOrg, {
    onSuccess: ({ data }) => {
      if (data?.failure) {
        toast.error(data.failure.reason ?? "Ocurrió un error")
        return
      } else if (!data?.success) {
        router.push("/dashboard")
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
            <CardTitle>Datos generals</CardTitle>
          </CardHeader>
          <CardContent>
            <fieldset className="space-y-4">
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
                      Este será el nombre de tu sitio web
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
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
                "Continuar"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
