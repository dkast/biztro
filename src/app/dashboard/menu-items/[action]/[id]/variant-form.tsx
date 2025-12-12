"use client"

// legacy Form helpers removed in favor of Field primitives
import {
  Controller,
  type Control,
  type FieldArrayWithId,
  type UseFormReturn
} from "react-hook-form"
import { Trash } from "lucide-react"
import type { z } from "zod/v4"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import VariantDelete from "@/app/dashboard/menu-items/[action]/[id]/variant-delete"
import { type menuItemSchema } from "@/lib/types"

export default function VariantForm({
  fieldArray,
  parentForm
}: {
  fieldArray: FieldArrayWithId<z.infer<typeof menuItemSchema>>[]
  parentForm: UseFormReturn<z.infer<typeof menuItemSchema>>
}) {
  return (
    <>
      {fieldArray.length > 1 ? (
        <MultiVariantForm fieldArray={fieldArray} parentForm={parentForm} />
      ) : (
        <SingleVariantForm control={parentForm.control} />
      )}
    </>
  )
}

function MultiVariantForm({
  fieldArray,
  parentForm
}: {
  fieldArray: FieldArrayWithId<z.infer<typeof menuItemSchema>>[]
  parentForm: UseFormReturn<z.infer<typeof menuItemSchema>>
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fieldArray.map((field, index) => (
          <TableRow key={field.id}>
            <TableCell>
              <Controller
                name={`variants.${index}.name`}
                control={parentForm.control}
                render={({ field, fieldState }) => (
                  <Field className="space-y-0">
                    <FieldLabel htmlFor={field.name} className="sr-only">
                      Nombre
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Nombre de la variante"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </TableCell>
            <TableCell>
              <Controller
                name={`variants.${index}.price`}
                control={parentForm.control}
                render={({ field, fieldState }) => (
                  <Field className="space-y-0">
                    <FieldLabel htmlFor={field.name} className="sr-only">
                      Precio
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min={0}
                      placeholder="Precio"
                      onChange={e => field.onChange(Number(e.target.value))}
                      onFocus={e => (e.target as HTMLInputElement).select()}
                      value={field.value ?? ""}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </TableCell>
            <TableCell className="flex justify-center">
              <VariantDelete
                variantId={parentForm.getValues(`variants.${index}.id`)}
                menuItemId={parentForm.getValues(
                  `variants.${index}.menuItemId`
                )}
              >
                <Button type="button" variant="ghost">
                  <Trash className="size-3.5 text-red-500" />
                </Button>
              </VariantDelete>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function SingleVariantForm({
  control
}: {
  control: Control<z.infer<typeof menuItemSchema>>
}) {
  return (
    <Controller
      name={"variants.0.price"}
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={field.name}>Precio</FieldLabel>
          <Input
            {...field}
            id={field.name}
            type="number"
            inputMode="numeric"
            placeholder="Precio"
            className="w-1/3"
            onChange={e => field.onChange(Number(e.target.value))}
            onFocus={e => (e.target as HTMLInputElement).select()}
            value={field.value ?? ""}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
