"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Prisma } from "@prisma/client"
import {
  Check,
  ChevronsUpDown,
  Loader2,
  PlusIcon,
  TriangleAlert
} from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import type { z } from "zod"

import { EmptyImageField } from "@/components/dashboard/empty-image-field"
import { ImageField } from "@/components/dashboard/image-field"
import PageSubtitle from "@/components/dashboard/page-subtitle"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  ComboBox,
  ComboBoxEmpty,
  ComboBoxGroup,
  ComboBoxInput,
  ComboBoxItem,
  ComboBoxList
} from "@/components/ui/combobox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createCategory, updateItem } from "@/server/actions/item/mutations"
import type {
  getCategories,
  getMenuItemById
} from "@/server/actions/item/queries"
import { ImageType, menuItemSchema } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function ItemForm({
  item,
  categories,
  action
}: {
  item: Prisma.PromiseReturnType<typeof getMenuItemById>
  categories: Prisma.PromiseReturnType<typeof getCategories>
  action: string
}) {
  const form = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      id: item?.id,
      name: item?.name,
      description: item?.description ?? undefined,
      image: item?.image ?? undefined,
      categoryId: item?.category?.id ?? undefined
    }
  })
  const [openCategory, setOpenCategory] = useState<boolean>(false)
  const [searchCategory, setSearchCategory] = useState<string>("")

  const title = (action === "new" ? "Crear" : "Editar") + " Producto"

  const {
    execute: executeCategory,
    status: statusCategory,
    reset: resetCategory
  } = useAction(createCategory, {
    onSuccess: data => {
      if (data?.success) {
        // toast.success("Categoría agregada")
      } else if (data?.failure.reason) {
        toast.error(data?.failure.reason)
      }

      resetCategory()
    },
    onError: () => {
      toast.error("No se pudo agregar la categoría")
      resetCategory()
    }
  })

  const handleAddCategory = () => {
    if (searchCategory) {
      executeCategory({ name: searchCategory })
    }
  }

  const { execute, status, reset } = useAction(updateItem, {
    onSuccess: data => {
      if (data?.success) {
        toast.success("Producto actualizado")
      } else if (data?.failure.reason) {
        toast.error(data?.failure.reason)
      }

      reset()
    },
    onError: () => {
      toast.error("No se pudo actualizar el producto")
    }
  })

  const onSubmit = async (data: z.infer<typeof menuItemSchema>) => {
    console.log(data)
    execute(data)
  }

  if (!item) {
    return (
      <Alert variant="warning">
        <TriangleAlert className="size-4" />
        <AlertTitle>Producto no encontrado</AlertTitle>
        <AlertDescription>
          El producto que buscas no existe o fue eliminado
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div>
      <PageSubtitle title={title} />
      <Form {...form}>
        <form
          className="mt-10 space-y-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="name">Nombre</FormLabel>
                <FormControl>
                  <Input {...field} id="name" className="Nombre del producto" />
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
                    placeholder="Agrega una descripción. Describe detalles como ingredientes, sabor, etc."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-2">
            <FormLabel>Imágen del producto</FormLabel>
            {item?.image ? (
              <ImageField
                src={item.image}
                organizationId={item.organizationId}
                imageType={ImageType.MENUITEM}
                objectId={item.id}
                className="sm:w-1/2"
              />
            ) : (
              <EmptyImageField
                organizationId={item.organizationId}
                imageType={ImageType.MENUITEM}
                objectId={item.id}
                className="sm:w-1/2"
              />
            )}
          </div>
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="categoryId">Categoría</FormLabel>
                <ComboBox
                  open={openCategory}
                  setOpen={setOpenCategory}
                  trigger={
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "flex w-full justify-between sm:w-[300px]",
                          field.value ?? "text-gray-500"
                        )}
                      >
                        {field.value
                          ? categories.find(
                              category => category.id === field.value
                            )?.name
                          : "Seleccionar Categoría"}
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  }
                >
                  <ComboBoxInput
                    value={searchCategory}
                    onValueChange={setSearchCategory}
                    placeholder="Buscar categoría..."
                  />
                  <ComboBoxList className="max-h-full sm:max-h-[300px]">
                    <ComboBoxEmpty className="p-2">
                      <Button
                        disabled={statusCategory === "executing"}
                        variant="ghost"
                        className="w-full"
                        size="xs"
                        onClick={handleAddCategory}
                      >
                        {statusCategory === "executing" ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <PlusIcon className="mr-2 size-4" />
                        )}
                        {searchCategory
                          ? `Agregar "${searchCategory}"`
                          : "Agregar"}
                      </Button>
                    </ComboBoxEmpty>
                    <ComboBoxGroup className="overflow-y-auto sm:max-h-[300px]">
                      {categories.map(category => (
                        <ComboBoxItem
                          value={category.name}
                          key={category.id}
                          onSelect={() => {
                            if (category.id) {
                              form.setValue("categoryId", category.id)
                              setOpenCategory(false)
                            }
                          }}
                          className="py-2 text-base sm:py-1.5 sm:text-sm"
                        >
                          <Check
                            className={cn(
                              "mr-2 size-4",
                              category.id === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {category.name}
                        </ComboBoxItem>
                      ))}
                    </ComboBoxGroup>
                  </ComboBoxList>
                </ComboBox>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={status === "executing"} type="submit">
            {status === "executing" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {"Guardando..."}
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
