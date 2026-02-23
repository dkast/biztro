"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { motion } from "motion/react"
import { useAction } from "next-safe-action/hooks"
import { TextMorph } from "torph/react"
import { z } from "zod/v4"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { joinWaitlist } from "@/server/actions/organization/mutations"

const emailSchema = z.object({
  email: z.email({
    error: "Por favor, ingresa un correo electrónico válido"
  })
})

export default function Waitlist() {
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: ""
    }
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { execute, status, reset } = useAction(joinWaitlist, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        setIsSubmitted(true)
      } else if (data?.failure.reason) {
        toast(data.failure.reason)
      }
      reset()
    }
  })

  const onSubmit = async (data: z.infer<typeof emailSchema>) => {
    await execute(data)
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-center space-y-4"
      >
        {/* <span className="text-gray-500">Unirse a la lista de espera</span> */}
        {!isSubmitted ? (
          <div
            className="flex flex-row items-center justify-center gap-x-2
              rounded-full bg-taupe-950 p-1 shadow-lg dark:bg-taupe-800"
          >
            <Controller
              name="email"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <Input
                    type="email"
                    placeholder="nombre@correo.com"
                    className="h-8 max-w-[300px] rounded-full border-0
                      bg-transparent text-white placeholder:text-taupe-400
                      focus-visible:ring-0 focus-visible:ring-offset-0
                      dark:bg-transparent"
                    {...field}
                  />
                </Field>
              )}
            />
            <Button
              disabled={status === "executing"}
              type="submit"
              size="xs"
              className="focus:ring-opacity-50 rounded-full bg-orange-600 px-4
                py-2 text-white transition-colors duration-200 ease-in-out
                hover:bg-orange-500 focus:ring-2 focus:ring-orange-500
                focus:outline-hidden"
            >
              {status === "executing" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <TextMorph>
                {status === "executing" ? "Procesando..." : "Unirse"}
              </TextMorph>
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert
              className="max-w-xl space-y-2 border-taupe-200 bg-taupe-50
                dark:border-taupe-700/30 dark:bg-taupe-900/20"
            >
              <AlertTitle className="text-taupe-950 dark:text-taupe-50">
                ¡Gracias por tu interés!
              </AlertTitle>
              <AlertDescription className="text-taupe-700 dark:text-taupe-300">
                Te enviaremos un correo electrónico cuando estemos listos para
                que puedas probar la aplicación.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </form>
    </Form>
  )
}
