"use client"

import { Fragment } from "react"
import type { TimeValue } from "react-aria"
import { useFieldArray, useForm } from "react-hook-form"
// import { DevTool } from "@hookform/devtools"
import { zodResolver } from "@hookform/resolvers/zod"
import { parseTime } from "@internationalized/date"
import { z } from "zod"

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

const hoursSchema = z.object({
  locationId: z.string().cuid().optional(),
  items: z.array(
    z
      .object({
        id: z.string().cuid().optional(),
        day: z.enum([
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
          "SUNDAY"
        ]),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        allDay: z.boolean()
      })
      .refine(
        data => {
          if (data.allDay) {
            return data.startTime && data.endTime
          } else {
            return true
          }
        },
        {
          message: "Ingresa la hora",
          path: ["allDay"]
        }
      )
  )
})

export default function HoursForm() {
  const form = useForm<z.infer<typeof hoursSchema>>({
    resolver: zodResolver(hoursSchema),
    mode: "onSubmit",
    defaultValues: {
      items: [
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

  const { fields } = useFieldArray({
    control: form.control,
    name: "items"
  })

  const onSubmit = (values: z.infer<typeof hoursSchema>) => {
    console.log(values)
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
                    <FormLabel>Desde</FormLabel>
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
                    <FormLabel>Hasta</FormLabel>
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
        <Button type="submit">Actualizar Horario</Button>
      </form>
      {/* <DevTool control={form.control} /> */}
    </Form>
  )
}
