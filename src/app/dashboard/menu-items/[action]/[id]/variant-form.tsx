"use client"

import type { Control, FieldArrayWithId } from "react-hook-form"
import type { z } from "zod"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { menuItemSchema } from "@/lib/types"

export default function VariantForm({
  fieldArray,
  control
}: {
  fieldArray: FieldArrayWithId<z.infer<typeof menuItemSchema>>[]
  control: Control<z.infer<typeof menuItemSchema>>
}) {
  return (
    <div>
      {fieldArray.map((field, index) => (
        <div key={field.id} className="space-y-2">
          <FormField
            control={control}
            name={`variants.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={`variants.${index}.name`}>Nombre</FormLabel>
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
          <FormField
            control={control}
            name={`variants.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={`variants.${index}.description`}>
                  Descripción
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    id={`variants.${index}.description`}
                    placeholder="Agrega una descripción. Describe detalles como ingredientes, sabor, etc."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`variants.${index}.price`}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={`variants.${index}.price`}>
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
        </div>
      ))}
    </div>
  )
}
