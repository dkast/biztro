"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"

import {
  Card,
  CardContent,
  CardDescription,
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
import { orgSchema } from "@/lib/types"

export default function NewOrgForm() {
  const form = useForm<z.infer<typeof orgSchema>>({
    resolver: zodResolver(orgSchema)
  })
  return (
    <div>
      <Card className="min-w-96">
        <CardHeader>
          <CardTitle>Bienvenido a Biztro</CardTitle>
          <CardDescription>Dinos un poco sobre tu negocio</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form>
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
              </fieldset>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
