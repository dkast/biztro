"use client"

import { type Control, type FieldArrayWithId } from "react-hook-form"
import { Trash } from "lucide-react"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { type menuItemSchema } from "@/lib/types"

export default function VariantForm({
  fieldArray,
  control
}: {
  fieldArray: FieldArrayWithId<z.infer<typeof menuItemSchema>>[]
  control: Control<z.infer<typeof menuItemSchema>>
}) {
  return (
    <>
      {fieldArray.length > 1 ? (
        <MultiVariantForm fieldArray={fieldArray} control={control} />
      ) : (
        <SingleVariantForm control={control} />
      )}
    </>
  )
}

function MultiVariantForm({
  fieldArray,
  control
}: {
  fieldArray: FieldArrayWithId<z.infer<typeof menuItemSchema>>[]
  control: Control<z.infer<typeof menuItemSchema>>
}) {
  return (
    <div>
      <h3 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
        Variantes
      </h3>
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
                <FormField
                  control={control}
                  name={`variants.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        htmlFor={`variants.${index}.name`}
                        className="sr-only"
                      >
                        Nombre
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id={`variants.${index}.name`}
                          placeholder="Nombre de la variante"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TableCell>
              <TableCell>
                <FormField
                  control={control}
                  name={`variants.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        htmlFor={`variants.${index}.price`}
                        className="sr-only"
                      >
                        Precio
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id={`variants.${index}.price`}
                          type="number"
                          placeholder="Precio"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TableCell>
              <TableCell>
                <Button type="button" variant="ghost">
                  <Trash className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function SingleVariantForm({
  control
}: {
  control: Control<z.infer<typeof menuItemSchema>>
}) {
  return (
    <FormField
      control={control}
      name={`variants.0.price`}
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor={`variants.0.price`}>Precio</FormLabel>
          <FormControl>
            <Input
              {...field}
              id={`variants.0.price`}
              type="number"
              placeholder="Precio"
              className="w-1/3"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
