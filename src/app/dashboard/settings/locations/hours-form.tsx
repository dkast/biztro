"use client"

import { Fragment, useEffect, useState } from "react"
import { type TimeValue } from "react-aria"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { parseTime } from "@internationalized/date"
import { Info, Loader } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { TextMorph } from "torph/react"
import type { z } from "zod/v4"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { TimeField } from "@/components/ui/date-time-picker/time-field"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { updateHours } from "@/server/actions/location/mutations"
import type { getDefaultLocation } from "@/server/actions/location/queries"
import { hoursSchema } from "@/lib/types/location"
import { cn } from "@/lib/utils"

type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY"

const DAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY"
]

const DAY_SHORT: Record<DayOfWeek, string> = {
  MONDAY: "Lu",
  TUESDAY: "Ma",
  WEDNESDAY: "Mi",
  THURSDAY: "Ju",
  FRIDAY: "Vi",
  SATURDAY: "Sá",
  SUNDAY: "Do"
}

const DAY_FULL: Record<DayOfWeek, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo"
}

type HourItem = {
  id?: string
  day: DayOfWeek
  startTime?: string
  endTime?: string
  allDay: boolean
}

/** Returns true when all open days share the exact same start/end time. */
function isUniformSchedule(items: HourItem[]): boolean {
  const open = items.filter(h => h.allDay)
  if (open.length === 0) return true
  const { startTime, endTime } = open[0]!
  return open.every(h => h.startTime === startTime && h.endTime === endTime)
}

function fromData(
  data: Awaited<ReturnType<typeof getDefaultLocation>> | null
): HourItem[] {
  const hours = data?.openingHours ?? []
  if (hours.length === 0) {
    return DAYS.map(day => ({ day, allDay: false }))
  }
  return hours.map(item => ({
    id: item.id,
    day: item.day as DayOfWeek,
    startTime: item.startTime ?? undefined,
    endTime: item.endTime ?? undefined,
    allDay: item.allDay
  }))
}

export default function HoursForm({
  data,
  locationId,
  onSuccess,
  submitLabel,
  secondaryAction,
  className
}: {
  data: Awaited<ReturnType<typeof getDefaultLocation>> | null
  locationId?: string
  onSuccess?: () => void
  submitLabel?: string
  secondaryAction?: React.ReactNode
  className?: string
}) {
  const initialItems = fromData(data)
  const initialOpen = initialItems.filter(h => h.allDay)
  const initialFirst = initialOpen[0]

  const [activeTab, setActiveTab] = useState<"basic" | "advanced">(
    isUniformSchedule(initialItems) ? "basic" : "advanced"
  )
  const [showMixedWarning, setShowMixedWarning] = useState(false)
  const [selectedDays, setSelectedDays] = useState<string[]>(
    initialOpen.map(h => h.day)
  )
  const [basicStart, setBasicStart] = useState<string | undefined>(
    initialFirst?.startTime
  )
  const [basicEnd, setBasicEnd] = useState<string | undefined>(
    initialFirst?.endTime
  )

  // Advanced mode form — kept in sync when switching tabs
  const form = useForm<z.infer<typeof hoursSchema>>({
    resolver: zodResolver(hoursSchema),
    mode: "onSubmit",
    defaultValues: { locationId: data?.id, items: initialItems }
  })

  const { fields } = useFieldArray({ control: form.control, name: "items" })
  const watchedItems = useWatch({ control: form.control, name: "items" })
  const effectiveLocationId = locationId ?? data?.id

  const { execute, status, reset } = useAction(updateHours, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Horario actualizado")
        onSuccess?.()
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

  function handleTabChange(value: string) {
    const tab = value as "basic" | "advanced"

    if (tab === "basic") {
      // Derive basic state from current advanced form
      const current = form.getValues("items")
      const open = current.filter(h => h.allDay)
      const first = open[0]
      setSelectedDays(open.map(h => h.day))
      setBasicStart(first?.startTime)
      setBasicEnd(first?.endTime)
      setShowMixedWarning(!isUniformSchedule(current))
    } else {
      // Sync advanced form from current basic state
      setShowMixedWarning(false)
      form.setValue(
        "items",
        DAYS.map(day => ({
          day,
          allDay: selectedDays.includes(day),
          startTime: selectedDays.includes(day) ? basicStart : undefined,
          endTime: selectedDays.includes(day) ? basicEnd : undefined
        }))
      )
    }

    setActiveTab(tab)
  }

  function onSubmit() {
    if (activeTab === "basic") {
      if (selectedDays.length > 0 && (!basicStart || !basicEnd)) {
        toast.error("Ingresa el horario de apertura y cierre")
        return
      }
      execute({
        locationId: effectiveLocationId,
        items: DAYS.map(day => ({
          day,
          allDay: selectedDays.includes(day),
          startTime: selectedDays.includes(day) ? basicStart : undefined,
          endTime: selectedDays.includes(day) ? basicEnd : undefined
        }))
      })
    } else {
      form.handleSubmit(values => {
        execute({
          locationId: effectiveLocationId,
          items: values.items.map(item => ({
            day: item.day,
            startTime: item.startTime,
            endTime: item.endTime,
            allDay: item.allDay
          }))
        })
      })()
    }
  }

  useEffect(() => {
    const next = fromData(data)
    const nextOpen = next.filter(h => h.allDay)
    const nextFirst = nextOpen[0]
    const nextMode = isUniformSchedule(next) ? "basic" : "advanced"
    setActiveTab(nextMode)
    setShowMixedWarning(false)
    setSelectedDays(nextOpen.map(h => h.day))
    setBasicStart(nextFirst?.startTime)
    setBasicEnd(nextFirst?.endTime)
    form.reset({ locationId: data?.id, items: next })
  }, [data, form])

  const isExecuting = status === "executing"
  const disabled = effectiveLocationId === undefined

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex w-full flex-col"
      >
        <TabsList className="mb-6 w-fit" variant="line">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="advanced">Avanzado</TabsTrigger>
        </TabsList>

        {/* ── Basic mode ── */}
        <TabsContent value="basic">
          <FieldSet disabled={disabled}>
            <FieldGroup>
              {showMixedWarning && (
                <Alert variant="warning">
                  <Info className="size-4" />
                  <AlertDescription>
                    El horario actual tiene horas diferentes por día. Al guardar
                    en modo básico, se aplicará el mismo horario a todos los
                    días seleccionados.
                  </AlertDescription>
                </Alert>
              )}
              <Field>
                <FieldLabel>Días de atención</FieldLabel>
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  value={selectedDays}
                  onValueChange={setSelectedDays}
                  className="flex-wrap justify-start gap-2"
                >
                  {DAYS.map(day => (
                    <ToggleGroupItem
                      key={day}
                      value={day}
                      aria-label={DAY_FULL[day]}
                      className="data-[state=on]:bg-primary/10
                        data-[state=on]:border-primary min-w-10 px-3"
                    >
                      {DAY_SHORT[day]}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <FieldDescription>
                  Selecciona los días en que tu negocio está abierto.
                </FieldDescription>
              </Field>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <Field className="sm:w-40">
                  <FieldLabel>Desde</FieldLabel>
                  <TimeField
                    isDisabled={disabled || selectedDays.length === 0}
                    value={basicStart ? parseTime(basicStart) : undefined}
                    onChange={(value: TimeValue | null) => {
                      setBasicStart(value?.toString() ?? undefined)
                    }}
                  />
                </Field>
                <Field className="sm:w-40">
                  <FieldLabel>Hasta</FieldLabel>
                  <TimeField
                    isDisabled={disabled || selectedDays.length === 0}
                    value={basicEnd ? parseTime(basicEnd) : undefined}
                    onChange={(value: TimeValue | null) => {
                      setBasicEnd(value?.toString() ?? undefined)
                    }}
                  />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
        </TabsContent>

        {/* ── Advanced mode ── */}
        <TabsContent value="advanced">
          <FieldSet disabled={disabled}>
            <FieldGroup>
              <div className="grid grid-cols-3 gap-4">
                {fields.map((field, index) => (
                  <Fragment key={field.id}>
                    <div className="flex flex-row items-center gap-3">
                      <Controller
                        name={`items.${index}.allDay`}
                        control={form.control}
                        render={({ field: ctlField, fieldState }) => (
                          <Field
                            className="mt-1 flex flex-1 flex-row items-center
                              justify-between space-y-0"
                          >
                            <FieldLabel
                              htmlFor={`items.${index}.allDay`}
                              className="cursor-pointer text-sm font-medium"
                            >
                              {DAY_FULL[field.day as DayOfWeek]}
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
                        <Field
                          className="flex flex-row items-center gap-2 space-y-0"
                        >
                          <FieldLabel className="hidden sm:inline">
                            Desde
                          </FieldLabel>
                          <TimeField
                            isDisabled={!watchedItems?.[index]?.allDay}
                            value={
                              ctlField.value
                                ? parseTime(ctlField.value)
                                : undefined
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
                        <Field
                          className="flex flex-row items-center gap-2 space-y-0"
                        >
                          <FieldLabel className="hidden sm:inline">
                            Hasta
                          </FieldLabel>
                          <TimeField
                            isDisabled={!watchedItems?.[index]?.allDay}
                            value={
                              ctlField.value
                                ? parseTime(ctlField.value)
                                : undefined
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
              </div>
            </FieldGroup>
          </FieldSet>
        </TabsContent>
      </Tabs>
      <FieldGroup>
        <Field orientation="responsive">
          <div
            className="flex w-full flex-col gap-2 sm:flex-row sm:items-center
              sm:justify-end"
          >
            {secondaryAction}
            <Button
              type="button"
              disabled={isExecuting || disabled}
              onClick={onSubmit}
            >
              {isExecuting && <Loader className="mr-2 size-4 animate-spin" />}
              <TextMorph>
                {isExecuting
                  ? "Guardando..."
                  : (submitLabel ?? "Actualizar Horario")}
              </TextMorph>
            </Button>
          </div>
        </Field>
      </FieldGroup>
    </div>
  )
}
