"use client"

import { Fragment } from "react"
import type { TimeValue } from "react-aria"
import { useFieldArray, useForm } from "react-hook-form"
import toast from "react-hot-toast"
// import { DevTool } from "@hookform/devtools"
import { zodResolver } from "@hookform/resolvers/zod"
import { parseTime } from "@internationalized/date"
import type { Prisma } from "@prisma/client"
import { Loader } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { TimeField } from "@/components/ui/date-time-picker/time-field"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { updateHours } from "@/server/actions/location/mutations"
import type { getDefaultLocation } from "@/server/actions/location/queries"
import { hoursSchema } from "@/lib/types"

export default function HoursForm({
  data
}: {
  data: Prisma.PromiseReturnType<typeof getDefaultLocation> | null
}) {
  const form = useForm<z.infer<typeof hoursSchema>>({
    resolver: zodResolver(hoursSchema),
    mode: "onSubmit",
    defaultValues: {
      locationId: data?.id,
      items:
        (data?.openingHours?.length ?? 0 > 0)
          ? data?.openingHours.map(item => ({
              id: item.id,
              day: item.day as
                | "MONDAY"
                | "TUESDAY"
                | "WEDNESDAY"
                | "THURSDAY"
                | "FRIDAY"
                | "SATURDAY"
                | "SUNDAY",
              startTime: item.startTime ?? undefined,
              endTime: item.endTime ?? undefined,
              allDay: item.allDay
            }))
          : [
              {
                day: "MONDAY",
                allDay: false
              },
              {
                day: "TUESDAY",
                allDay: false
              },
              {
                day: "WEDNESDAY",
                allDay: false
              },
              {
                day: "THURSDAY",
                allDay: false
              },
              {
                day: "FRIDAY",
                allDay: false
              },
              {
                day: "SATURDAY",
                allDay: false
              },
              {
                day: "SUNDAY",
                allDay: false
              }
            ]
    }
  })

  const { execute, status, reset } = useAction(updateHours, {
    onSuccess: data => {
      if (data?.success) {
        toast.success("Horario actualizado")
      } else if (data?.failure.reason) {
        toast.error(data.failure.reason)
      }
      reset()
    },
    onError: () => {
      toast.error("No se pudo actualizar el horario")
      reset()
    }
  })

  const { fields } = useFieldArray({
    control: form.control,
    name: "items"
  })

  const onSubmit = (values: z.infer<typeof hoursSchema>) => {
    execute({
      locationId: values.locationId,
      items: values.items.map(item => ({
        day: item.day,
        startTime: item.startTime,
        endTime: item.endTime,
        allDay: item.allDay
      }))
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {fields.map((field, index) => (
            <Fragment key={field.id}>
              <div className="flex flex-row items-center gap-3">
                <FormField
                  control={form.control}
                  name={`items.${index}.allDay`}
                  render={({ field }) => (
                    <FormItem className="mt-1 space-y-0">
                      <FormControl>
                        <Switch
                          id={`items.${index}.allDay`}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <label
                  htmlFor={`items.${index}.allDay`}
                  className="cursor-pointer text-sm font-medium"
                >
                  {field.day === "MONDAY" && "Lunes"}
                  {field.day === "TUESDAY" && "Martes"}
                  {field.day === "WEDNESDAY" && "Miércoles"}
                  {field.day === "THURSDAY" && "Jueves"}
                  {field.day === "FRIDAY" && "Viernes"}
                  {field.day === "SATURDAY" && "Sábado"}
                  {field.day === "SUNDAY" && "Domingo"}
                </label>
              </div>
              <FormField
                control={form.control}
                name={`items.${index}.startTime`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormLabel className="hidden sm:inline">Desde</FormLabel>
                    <FormControl>
                      <TimeField
                        value={field.value ? parseTime(field.value) : undefined}
                        onChange={(value: TimeValue) => {
                          field.onChange(value.toString())
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.endTime`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormLabel className="hidden sm:inline">Hasta</FormLabel>
                    <FormControl>
                      <TimeField
                        value={field.value ? parseTime(field.value) : undefined}
                        onChange={(value: TimeValue) => {
                          field.onChange(value.toString())
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Fragment>
          ))}
        </div>
        <Button type="submit" disabled={status === "executing"}>
          {status === "executing" ? (
            <>
              <Loader className="mr-2 size-4 animate-spin" />
              {"Guardando..."}
            </>
          ) : (
            "Actualizar Horario"
          )}
        </Button>
      </form>
      {/* <DevTool control={form.control} /> */}
    </Form>
  )
}
