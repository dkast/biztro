"use client"

import React, { useEffect, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Prisma } from "@prisma/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Check,
  ChevronsUpDown,
  Loader,
  PlusCircle,
  PlusIcon,
  TriangleAlert,
  X
} from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import type { z } from "zod"

import { EmptyImageField } from "@/components/dashboard/empty-image-field"
import { ImageField } from "@/components/dashboard/image-field"
import PageSubtitle from "@/components/dashboard/page-subtitle"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MultiSelect } from "@/components/ui/multi-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch" // Add this import
import { Textarea } from "@/components/ui/textarea"
import { createCategory, updateItem } from "@/server/actions/item/mutations"
import {
  getCategories,
  type getMenuItemById
} from "@/server/actions/item/queries"
import { VariantCreate } from "@/app/dashboard/menu-items/[action]/[id]/variant-create"
import VariantForm from "@/app/dashboard/menu-items/[action]/[id]/variant-form"
import {
  Allergens,
  ImageType,
  menuItemSchema,
  MenuItemStatus
} from "@/lib/types"
import { cn } from "@/lib/utils"

export default function ItemForm({
  item,
  // categories,
  action
}: {
  item: Prisma.PromiseReturnType<typeof getMenuItemById>
  // categories: Prisma.PromiseReturnType<typeof getCategories>
  action: string
}) {
  const form = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      id: item?.id,
      name: item?.name,
      description: item?.description ?? undefined,
      status: item?.status as MenuItemStatus,
      image: item?.image ?? undefined,
      categoryId: item?.category?.id ?? undefined,
      organizationId: item?.organizationId,
      featured: item?.featured ?? false,
      variants:
        item?.variants.map(variant => ({
          ...variant,
          description: variant.description ?? undefined
        })) ?? [],
      allergens: item?.allergens ?? undefined
    }
  })
  const [openCategory, setOpenCategory] = useState<boolean>(false)
  const [searchCategory, setSearchCategory] = useState<string>("")
  const [openVariant, setOpenVariant] = useState<boolean>(false)

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    initialData: [] // default value
  })
  const queryClient = useQueryClient()

  const title = `${action === "new" ? "Crear" : "Editar"} Producto`

  const router = useRouter()

  const { fields } = useFieldArray({
    control: form.control,
    name: "variants"
  })

  const {
    execute: executeCategory,
    status: statusCategory,
    reset: resetCategory
  } = useAction(createCategory, {
    onSuccess: ({ data }) => {
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
      queryClient.invalidateQueries({
        queryKey: ["categories"]
      })
    }
  }

  const handleOpenVariant = () => {
    if (form.formState.isDirty) {
      toast("Guarda los cambios antes de agregar una variante")
      return
    }
    setOpenVariant(true)
  }

  const { execute, status, reset } = useAction(updateItem, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Producto actualizado")
        // router.back()
      } else if (data?.failure.reason) {
        toast.error(data?.failure.reason)
      }

      reset()
    },
    onError: () => {
      toast.error("No se pudo actualizar el producto")
    }
  })

  const onSubmit = (data: z.infer<typeof menuItemSchema>) => {
    execute(data)
  }

  const saveRef = React.useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (item?.variants && item.variants.length > 0) {
      const mappedVariants = item.variants.map(variant => ({
        name: variant.name,
        price: variant.price,
        id: variant.id,
        description: variant.description ?? undefined,
        menuItemId: variant.menuItemId
      }))
      form.setValue(
        "variants",
        mappedVariants as z.infer<typeof menuItemSchema>["variants"]
      )
    }
  }, [item?.variants, form])

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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <PageSubtitle title={title}>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => router.back()}
                ref={saveRef}
              >
                Cerrar
              </Button>
              <Button disabled={status === "executing"} size="sm" type="submit">
                {status === "executing" ? (
                  <>
                    <Loader className="mr-2 size-4 animate-spin" />
                    {"Guardando"}
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </div>
          </PageSubtitle>
          <div className="mt-10 grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Detalles del Producto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="name">Nombre</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            id="name"
                            placeholder="Nombre del producto"
                          />
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
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Variantes</CardTitle>
                  <CardDescription>
                    Agrega variantes para mostrar diferentes opciones de un
                    mismo producto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VariantForm fieldArray={fields} parentForm={form} />
                </CardContent>
                <CardFooter className="justify-center dark:border-gray-800">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleOpenVariant}
                    className="w-full gap-1"
                  >
                    <PlusCircle className="size-3.5" />
                    Crear variante
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center space-x-2">
                          <ComboBox
                            open={openCategory}
                            setOpen={setOpenCategory}
                            trigger={
                              <FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "flex w-[300px] justify-between",
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
                                  type="button"
                                  disabled={statusCategory === "executing"}
                                  variant="ghost"
                                  className="w-full"
                                  size="xs"
                                  onClick={handleAddCategory}
                                >
                                  {statusCategory === "executing" ? (
                                    <Loader className="mr-2 size-4 animate-spin" />
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
                          {field.value && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                form.setValue("categoryId", "")
                              }}
                            >
                              <X className="size-4" />
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Alérgenos e Indicadores</CardTitle>
                  <CardDescription>
                    Selecciona los alérgenos o indicadores especiales para este
                    producto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="allergens"
                    render={({ field }) => (
                      <FormItem>
                        <MultiSelect
                          options={Allergens.map(allergen => ({
                            label: allergen.label,
                            value: allergen.value
                          }))}
                          defaultValue={
                            field.value?.split(",").filter(Boolean) || []
                          }
                          onValueChange={values => {
                            form.setValue("allergens", values.join(","))
                          }}
                          placeholder="Seleccionar alérgenos"
                          variant="default"
                          maxCount={4}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Imágen del Producto</CardTitle>
                </CardHeader>
                <CardContent>
                  {item?.image ? (
                    <ImageField
                      src={item.image}
                      organizationId={item.organizationId}
                      imageType={ImageType.MENUITEM}
                      objectId={item.id}
                      onUploadSuccess={() => {
                        router.refresh()
                      }}
                    />
                  ) : (
                    <EmptyImageField
                      organizationId={item.organizationId}
                      imageType={ImageType.MENUITEM}
                      objectId={item.id}
                      onUploadSuccess={() => {
                        router.refresh()
                      }}
                    />
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Status del Producto</CardTitle>
                  <CardDescription>
                    Cambia el estado del producto para mostrarlo u ocultarlo en
                    el menú
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={MenuItemStatus.ACTIVE}>
                              Activo
                            </SelectItem>
                            <SelectItem value={MenuItemStatus.DRAFT}>
                              Borrador
                            </SelectItem>
                            <SelectItem value={MenuItemStatus.ARCHIVED}>
                              Archivado
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="mt-4 flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                        <div className="space-y-0.5">
                          <FormLabel>Recomendado</FormLabel>
                          <FormDescription>
                            Mostrar producto en la sección de recomendados
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
      <VariantCreate
        menuItemId={item.id}
        open={openVariant}
        setOpen={setOpenVariant}
      />
    </div>
  )
}
