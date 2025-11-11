"use client"

import React, { useEffect, useState } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import toast from "react-hot-toast"
// import { DevTool } from "@hookform/devtools"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Prisma } from "@prisma/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Check,
  Loader,
  PlusCircle,
  PlusIcon,
  TriangleAlert,
  X
} from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import type { z } from "zod/v4"

import { EmptyImageField } from "@/components/dashboard/empty-image-field"
import { ImageField } from "@/components/dashboard/image-field"
import PageSubtitle from "@/components/dashboard/page-subtitle"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger
} from "@/components/kibo-ui/combobox"
import {
  Tags,
  TagsContent,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsValue
} from "@/components/kibo-ui/tags"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
// legacy Form helpers removed in favor of Field primitives
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
  item: NonNullable<Prisma.PromiseReturnType<typeof getMenuItemById>>
  // categories: Prisma.PromiseReturnType<typeof getCategories>
  action: string
}) {
  const form = useForm<z.output<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      id: item.id,
      name: item.name,
      description: item.description ?? undefined,
      status: item.status as MenuItemStatus,
      image: item.image ?? undefined,
      categoryId: item.category?.id ?? undefined,
      organizationId: item.organizationId,
      featured: item?.featured ?? false,
      variants:
        item.variants.map(variant => ({
          ...variant,
          price: variant.price,
          description: variant.description ?? undefined
        })) ?? [],
      allergens: item.allergens ?? undefined
    }
  })
  const [openCategory, setOpenCategory] = useState<boolean>(false)
  const [searchCategory, setSearchCategory] = useState<string>("")
  const [openVariant, setOpenVariant] = useState<boolean>(false)

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(item.organizationId),
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
        form.reset(undefined, { keepValues: true, keepDirty: false })

        router.refresh()
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
    // Ensure price is a number before submitting
    if (data.variants) {
      const mapped = data.variants.map(variant => ({
        ...variant,
        price: Number(variant.price)
      }))
      // menuItemSchema may type variants as a non-empty tuple; assert to the expected type
      data.variants = mapped as unknown as z.infer<
        typeof menuItemSchema
      >["variants"]
    }

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
    <div className="pb-20">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <PageSubtitle
          title={title}
          className="border-border bg-background sticky top-0 z-10 rounded-xl border px-4 py-3 shadow-xs"
        >
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
        <div className="mt-10">
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3">
              <FieldSet className="lg:col-span-2">
                <FieldLegend>Detalles del Producto</FieldLegend>
                <FieldGroup>
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          placeholder="Nombre del producto"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>
                          Descripción
                        </FieldLabel>
                        <Textarea
                          {...field}
                          id={field.name}
                          placeholder="Agrega una descripción. Describe detalles como ingredientes, sabor, etc."
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </FieldSet>
              <FieldSet>
                <FieldLegend>Imágen del Producto</FieldLegend>
                <div className="h-full">
                  {item?.image ? (
                    <ImageField
                      className="h-full"
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
                      className="h-full"
                      organizationId={item.organizationId}
                      imageType={ImageType.MENUITEM}
                      objectId={item.id}
                      onUploadSuccess={() => {
                        router.refresh()
                      }}
                    />
                  )}
                </div>
              </FieldSet>
            </div>
            <FieldSet>
              <FieldContent className="flex gap-4 sm:flex-row">
                <Controller
                  name="status"
                  control={form.control}
                  render={({ field }) => (
                    <Field className="border-border rounded-lg border p-4">
                      <FieldLabel htmlFor={field.name}>
                        Estatus del Producto
                      </FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
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
                      <FieldDescription>
                        Cambia el estado del producto para mostrarlo u ocultarlo
                        en el menú
                      </FieldDescription>
                    </Field>
                  )}
                />
                <Controller
                  name="featured"
                  control={form.control}
                  render={({ field }) => (
                    <Field
                      className="border-border rounded-lg border p-4"
                      orientation="horizontal"
                    >
                      <FieldContent>
                        <FieldLabel>Recomendado</FieldLabel>
                        <FieldDescription>
                          Mostrar producto en la sección de recomendados
                        </FieldDescription>
                      </FieldContent>

                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Field>
                  )}
                />
              </FieldContent>
            </FieldSet>
            <FieldSeparator />
            <FieldSet>
              <FieldLegend>Variantes</FieldLegend>
              <FieldDescription>
                Agrega variantes para mostrar diferentes opciones de un mismo
                producto
              </FieldDescription>
              <FieldGroup className="md:max-w-md lg:max-w-lg">
                <VariantForm fieldArray={fields} parentForm={form} />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleOpenVariant}
                  className="w-full gap-1"
                >
                  <PlusCircle className="size-3.5" />
                  Crear variante
                </Button>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
            <FieldSet>
              <FieldLegend>Categoría</FieldLegend>
              <FieldDescription>
                Asigna una categoría para agrupar productos similares y
                mostrarlos juntos en el menú.
              </FieldDescription>
              <Controller
                name="categoryId"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <div className="flex items-center space-x-2">
                      <Combobox
                        data={categories.map(
                          (c: { id: string; name: string }) => ({
                            label: c.name,
                            value: c.id
                          })
                        )}
                        type="category"
                        value={field.value}
                        onValueChange={(val: string) => {
                          form.setValue("categoryId", val)
                        }}
                      >
                        <ComboboxTrigger className="min-w-[300px]" />
                        <ComboboxContent>
                          <ComboboxInput
                            value={searchCategory}
                            onValueChange={setSearchCategory}
                            placeholder="Buscar categoría..."
                          />
                          <ComboboxList>
                            <ComboboxEmpty />
                            <ComboboxGroup>
                              {categories.map(
                                (category: { id: string; name: string }) => (
                                  <ComboboxItem
                                    value={category.id}
                                    key={category.id}
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
                                  </ComboboxItem>
                                )
                              )}
                            </ComboboxGroup>
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
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
                  </Field>
                )}
              />
            </FieldSet>
            <FieldSeparator />
            <FieldSet>
              <FieldLegend>Alérgenos e Indicadores</FieldLegend>
              <FieldDescription>
                Selecciona los alérgenos o indicadores especiales para este
                producto
              </FieldDescription>
              <Controller
                name="allergens"
                control={form.control}
                render={({ field, fieldState }) => {
                  const values =
                    ((field.value ?? "")
                      .split(",")
                      .filter(Boolean) as string[]) || []

                  return (
                    <Field>
                      <Tags
                        value={field.value}
                        setValue={(v: string) => form.setValue("allergens", v)}
                      >
                        <TagsTrigger placeholder="Buscar o añadir alérgenos">
                          {values.map(val => (
                            <TagsValue
                              variant="indigo"
                              key={val}
                              onRemove={() => {
                                const next = values.filter(v => v !== val)
                                form.setValue("allergens", next.join(","))
                              }}
                            >
                              {Allergens.find(a => a.value === val)?.label ??
                                val}
                            </TagsValue>
                          ))}
                        </TagsTrigger>
                        <TagsContent>
                          <TagsInput placeholder="Buscar o añadir alérgenos" />
                          <TagsList>
                            <TagsEmpty className="p-2" />
                            <TagsGroup>
                              {Allergens.map(allergen => (
                                <TagsItem
                                  key={allergen.value}
                                  onSelect={() => {
                                    const next = Array.from(
                                      new Set([...values, allergen.value])
                                    )
                                    form.setValue("allergens", next.join(","))
                                  }}
                                >
                                  {allergen.label}
                                </TagsItem>
                              ))}
                            </TagsGroup>
                          </TagsList>
                        </TagsContent>
                      </Tags>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )
                }}
              />
            </FieldSet>
          </FieldGroup>
        </div>
      </form>
      <VariantCreate
        menuItemId={item.id}
        open={openVariant}
        setOpen={setOpenVariant}
      />
      {/* <DevTool control={form.control} />  */}
    </div>
  )
}
