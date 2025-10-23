"use client"

import { Fragment } from "react"
import type { TimeValue } from "react-aria"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import toast from "react-hot-toast"
// import { DevTool } from "@hookform/devtools"
import { zodResolver } from "@hookform/resolvers/zod"
import { parseTime } from "@internationalized/date"
import type { Prisma } from "@prisma/client"
import { Loader } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import type { z } from "zod/v4"

import { Button } from "@/components/ui/button"
import { TimeField } from "@/components/ui/date-time-picker/time-field"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
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
    onSuccess: ({ data }) => {
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
      locationId: data?.id,
      items: values.items.map(item => ({
        day: item.day,
        startTime: item.startTime,
        endTime: item.endTime,
        allDay: item.allDay
      }))
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 space-y-6">
      <fieldset
        className="grid grid-cols-3 gap-4"
        disabled={data?.id === undefined}
      >
        {fields.map((field, index) => (
          <Fragment key={field.id}>
            <div className="flex flex-row items-center gap-3">
              <Controller
                name={`items.${index}.allDay`}
                control={form.control}
                render={({ field: ctlField, fieldState }) => (
                  <Field className="mt-1 flex flex-1 flex-row items-center justify-between space-y-0">
                    <FieldLabel
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
                    </FieldLabel>
                    <span>
                      <Switch
                        id={`items.${index}.allDay`}
                        checked={ctlField.value}
                        onCheckedChange={ctlField.onChange}
                      />
                    </span>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <Controller
              name={`items.${index}.startTime`}
              control={form.control}
              render={({ field: ctlField, fieldState }) => (
                <Field className="flex flex-row items-center gap-2 space-y-0">
                  <FieldLabel className="hidden sm:inline">Desde</FieldLabel>
                  {/* disable time inputs when the corresponding allDay switch is on */}
                  <TimeField
                    /* disable time inputs when the corresponding allDay switch is unchecked */
                    isDisabled={!form.watch(`items.${index}.allDay`)}
                    value={
                      ctlField.value ? parseTime(ctlField.value) : undefined
                    }
                    onChange={(value: TimeValue | null) => {
                      ctlField.onChange(value?.toString() ?? "")
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name={`items.${index}.endTime`}
              control={form.control}
              render={({ field: ctlField, fieldState }) => (
                <Field className="flex flex-row items-center gap-2 space-y-0">
                  <FieldLabel className="hidden sm:inline">Hasta</FieldLabel>
                  <TimeField
                    isDisabled={!form.watch(`items.${index}.allDay`)}
                    value={
                      ctlField.value ? parseTime(ctlField.value) : undefined
                    }
                    onChange={(value: TimeValue | null) => {
                      ctlField.onChange(value?.toString() ?? "")
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </Fragment>
        ))}
      </fieldset>
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
  )
}
