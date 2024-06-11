"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { z } from "zod"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem
  // FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { joinWaitlist } from "@/server/actions/organization/mutations"

const emailSchema = z.object({
  email: z.string().email({
    message: "El correo electrónico no es válido"
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
    onSuccess: data => {
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
          <div className="flex flex-row items-center justify-center gap-x-2 rounded-full bg-gray-800 p-1 shadow-lg">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="nombre@correo.com"
                      className="placeholder:text-gray-340 h-8 max-w-[300px] rounded-full border-0 bg-transparent text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                      {...field}
                    />
                  </FormControl>
                  {/* <FormMessage /> */}
                </FormItem>
              )}
            />
            <Button
              disabled={status === "executing"}
              type="submit"
              size="xs"
              className="bg-brand-500 rounded-full px-4 py-2 text-white transition-colors duration-200 ease-in-out hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
            >
              {status === "executing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  {"Procesando..."}
                </>
              ) : (
                "Unirse"
              )}
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className="max-w-xl space-y-2">
              <AlertTitle>¡Gracias por tu interés!</AlertTitle>
              <AlertDescription className="text-gray-600">
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
