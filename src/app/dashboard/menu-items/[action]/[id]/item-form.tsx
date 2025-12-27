"use client"

import React, { use, useEffect, useState } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import toast from "react-hot-toast"
// import { DevTool } from "@hookform/devtools"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, Loader, PlusCircle, TriangleAlert, X } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import type { z } from "zod/v4"

import { EmptyImageField } from "@/components/dashboard/empty-image-field"
import { ImageField } from "@/components/dashboard/image-field"
import PageSubtitle from "@/components/dashboard/page-subtitle"
import {
  Combobox,
  ComboboxContent,
  ComboboxCreateNew,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { syncMenusAfterCatalogChange } from "@/server/actions/menu/sync"
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
  promiseItem,
  // categories,
  action
}: {
  promiseItem: ReturnType<typeof getMenuItemById>
  // categories: Prisma.PromiseReturnType<typeof getCategories>
  action: string
}) {
  const item = use(promiseItem)

  const form = useForm<z.output<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      id: item?.id ?? "",
      name: item?.name ?? "",
      description: item?.description ?? "",
      status: (item?.status ?? MenuItemStatus.DRAFT) as MenuItemStatus,
      image: item?.image ?? undefined,
      categoryId: item?.category?.id ?? "",
      organizationId: item?.organizationId ?? "",
      featured: item?.featured ?? false,
      variants: (item?.variants ?? []).map(variant => ({
        id: variant.id ?? "",
        name: variant.name ?? "",
        price: variant.price ?? 0,
        description: variant.description ?? "",
        menuItemId: variant.menuItemId ?? ""
      })),
      allergens: item?.allergens ?? "",
      currency: (item?.currency as "MXN" | "USD") ?? "MXN"
    }
  })
  const [searchCategory, setSearchCategory] = useState<string>("")
  const [openVariant, setOpenVariant] = useState<boolean>(false)
  const [syncPrompt, setSyncPrompt] = useState({
    open: false,
    organizationId: item?.organizationId ?? "",
    rememberChoice: false
  })

  const { fields } = useFieldArray({
    control: form.control,
    name: "variants"
  })

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

  const queryClient = useQueryClient()

  const router = useRouter()

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(item?.organizationId ?? ""),
    initialData: [] // default value
  })

  const saveRef = React.useRef<HTMLButtonElement>(null)

  const title = `${action === "new" ? "Crear" : "Editar"} Producto`

  const { execute: executeCategory, reset: resetCategory } = useAction(
    createCategory,
    {
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
    }
  )

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

  const {
    execute: executeSyncMenus,
    status: statusSyncMenus,
    reset: resetSyncMenus
  } = useAction(syncMenusAfterCatalogChange, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        const { draftsUpdated, publishedUpdated } = data.success
        if (draftsUpdated || publishedUpdated) {
          toast.success("Menú actualizado")
        }
      } else if (data?.failure?.reason) {
        toast.error(data.failure.reason)
      }
      resetSyncMenus()
      setSyncPrompt(prev => ({ ...prev, open: false, rememberChoice: false }))
    },
    onError: () => {
      toast.error("No se pudo actualizar los menús")
      setSyncPrompt(prev => ({ ...prev, open: false }))
    }
  })

  const { execute, status, reset } = useAction(updateItem, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        const syncMeta = data.success.sync
        toast.success("Producto actualizado")

        if (syncMeta?.publishedUpdated) {
          toast.success("Menú publicado actualizado")
        }

        if (syncMeta?.needsPublishedDecision) {
          setSyncPrompt(prev => ({
            ...prev,
            open: true,
            rememberChoice: false,
            organizationId: item?.organizationId ?? ""
          }))
        }

        // Reset the form using the current values so RHF updates defaultValues
        // and clears the dirty state.
        form.reset(form.getValues())

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

  const handleSyncChoice = (updatePublished: boolean) => {
    if (!syncPrompt.organizationId) {
      setSyncPrompt(prev => ({ ...prev, open: false }))
      return
    }

    if (!syncPrompt.rememberChoice && updatePublished === false) {
      setSyncPrompt(prev => ({ ...prev, open: false }))
      return
    }

    executeSyncMenus({
      organizationId: syncPrompt.organizationId,
      updatePublished,
      rememberChoice: syncPrompt.rememberChoice
    })
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
    <div className="pb-20">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <PageSubtitle
          title={title}
          className="border-border bg-background sticky top-18 z-10 rounded-xl
            border px-4 py-3 shadow-xs group-[.is-dialog]:top-0"
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
                  name="currency"
                  control={form.control}
                  render={({ field }) => (
                    <Field className="border-border rounded-lg border p-4">
                      <FieldLabel htmlFor={field.name}>Moneda</FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar moneda" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={"MXN"}>MXN</SelectItem>
                          <SelectItem value={"USD"}>USD</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Selecciona la moneda del producto
                      </FieldDescription>
                    </Field>
                  )}
                />
                <Controller
                  name="featured"
                  control={form.control}
                  render={({ field }) => (
                    <Field
                      className="border-border
                        has-data-[state=checked]:bg-primary/10
                        has-data-[state=checked]:border-primary rounded-lg
                        border p-4"
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
                        type="Categoría"
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
                            <ComboboxEmpty>
                              <ComboboxCreateNew
                                onCreateNew={handleAddCategory}
                              />
                            </ComboboxEmpty>
                            <ComboboxGroup>
                              {categories.map(
                                (category: { id: string; name: string }) => (
                                  <ComboboxItem
                                    value={category.id}
                                    key={category.id}
                                    className="py-2 text-base sm:py-1.5
                                      sm:text-sm"
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
      <AlertDialog
        open={syncPrompt.open}
        onOpenChange={open =>
          setSyncPrompt(prev => ({ ...prev, open, rememberChoice: false }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Actualizar menús publicados?</AlertDialogTitle>
            <AlertDialogDescription>
              Se detectaron cambios en tus productos. ¿Quieres aplicar los
              cambios al menú publicado?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember-published-choice"
              checked={syncPrompt.rememberChoice}
              onCheckedChange={checked =>
                setSyncPrompt(prev => ({
                  ...prev,
                  rememberChoice: checked === true
                }))
              }
            />
            <label
              htmlFor="remember-published-choice"
              className="text-muted-foreground text-sm"
            >
              No volver a preguntar
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => handleSyncChoice(false)}
              disabled={statusSyncMenus === "executing"}
            >
              No ahora
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleSyncChoice(true)}
              disabled={statusSyncMenus === "executing"}
            >
              {statusSyncMenus === "executing"
                ? "Actualizando..."
                : "Actualizar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <VariantCreate
        menuItemId={item.id}
        open={openVariant}
        setOpen={setOpenVariant}
      />
      {/* <DevTool control={form.control} /> */}
    </div>
  )
}
