"use client"

import React, { use, useEffect, useState } from "react"
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type FieldErrors,
  type FieldValues
} from "react-hook-form"
import toast from "react-hot-toast"
// import { DevTool } from "@hookform/devtools"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Check,
  Languages,
  Loader,
  PlusCircle,
  TriangleAlert,
  X
} from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TextMorph } from "torph/react"
import { type z } from "zod/v4"

import { EmptyImageField } from "@/components/dashboard/empty-image-field"
import { ImageField } from "@/components/dashboard/image-field"
import { MenuSyncDialog } from "@/components/dashboard/menu-sync-dialog"
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
import { Button } from "@/components/ui/button"
// legacy Form helpers removed in favor of Field primitives
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
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
import { LanguageFlag } from "@/components/ui/language-flag"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch" // Add this import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { createCategory, updateItem } from "@/server/actions/item/mutations"
import {
  getCategories,
  type getMenuItemById
} from "@/server/actions/item/queries"
import { syncMenusAfterCatalogChange } from "@/server/actions/menu/sync"
import { VariantCreate } from "@/app/dashboard/menu-items/[action]/[id]/variant-create"
import VariantForm from "@/app/dashboard/menu-items/[action]/[id]/variant-form"
import { ImageType } from "@/lib/types/media"
import {
  Allergens,
  menuItemFormSchema,
  MenuItemStatus,
  menuItemTranslationSchema
} from "@/lib/types/menu-item"
import { type SupportedLocaleCode } from "@/lib/types/translations"
import { cn } from "@/lib/utils"

const spanishLanguageNames = new Intl.DisplayNames(["es"], {
  type: "language"
})

function getLocaleLabel(locale?: string | null) {
  if (!locale) {
    return ""
  }

  return spanishLanguageNames.of(locale) ?? locale
}

type FormTab = "details" | "translations"

type ValidationIssue = {
  path: string
  message: string
  tab: FormTab
}

function collectValidationIssues<TFieldValues extends FieldValues>(
  errors: FieldErrors<TFieldValues>,
  getTabForPath: (path: string) => FormTab,
  pathPrefix = ""
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  for (const [key, value] of Object.entries(errors)) {
    if (!value || key === "ref") {
      continue
    }

    const path = pathPrefix ? `${pathPrefix}.${key}` : key

    if (
      typeof value === "object" &&
      "message" in value &&
      typeof value.message === "string"
    ) {
      issues.push({
        path,
        message: value.message,
        tab: getTabForPath(path)
      })
    }

    if (typeof value === "object") {
      issues.push(
        ...collectValidationIssues(
          value as FieldErrors<TFieldValues>,
          getTabForPath,
          path
        )
      )
    }
  }

  return issues
}

function getTabForIssuePath(path: string): FormTab {
  return path.startsWith("translations.") ? "translations" : "details"
}

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

  const form = useForm<z.output<typeof menuItemFormSchema>>({
    resolver: zodResolver(menuItemFormSchema),
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
      translations: (item?.translations ?? []).map(translation => ({
        locale: translation.locale as SupportedLocaleCode,
        name: translation.name ?? "",
        description: translation.description ?? ""
      })),
      allergens: item?.allergens ?? "",
      currency: (item?.currency as "MXN" | "USD") ?? "MXN"
    }
  })
  const [searchCategory, setSearchCategory] = useState<string>("")
  const [openVariant, setOpenVariant] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<FormTab>("details")
  const [selectedLocale, setSelectedLocale] = useState<
    SupportedLocaleCode | ""
  >(
    () =>
      (item?.translations?.[0]?.locale as SupportedLocaleCode | undefined) ?? ""
  )
  const [syncPrompt, setSyncPrompt] = useState({
    open: false,
    organizationId: item?.organizationId ?? "",
    rememberChoice: false
  })

  const { fields } = useFieldArray({
    control: form.control,
    name: "variants"
  })
  const translations = useWatch({
    control: form.control,
    name: "translations"
  })

  const availableTranslations = translations ?? []
  const fallbackLocale = availableTranslations[0]?.locale ?? ""
  const activeLocale = availableTranslations.some(
    translation => translation.locale === selectedLocale
  )
    ? selectedLocale
    : fallbackLocale
  const selectedTranslationIndex = availableTranslations.findIndex(
    translation => translation.locale === activeLocale
  )
  const validationIssues = collectValidationIssues(
    form.formState.errors,
    getTabForIssuePath
  )

  const getIssueLabel = (path: string) => {
    if (path === "name") {
      return "Nombre del producto"
    }

    if (path === "description") {
      return "Descripción del producto"
    }

    if (path.startsWith("translations.")) {
      const [, indexText, fieldName] = path.split(".")
      const translation = availableTranslations[Number(indexText)]
      const localeLabel = getLocaleLabel(translation?.locale)

      if (fieldName === "name") {
        return localeLabel
          ? `Título traducido (${localeLabel})`
          : "Título traducido"
      }

      if (fieldName === "description") {
        return localeLabel
          ? `Descripción traducida (${localeLabel})`
          : "Descripción traducida"
      }
    }

    if (path.startsWith("variants.")) {
      return "Variantes"
    }

    if (path === "variants") {
      return "Variantes"
    }

    return "Formulario"
  }

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
        mappedVariants as z.infer<typeof menuItemFormSchema>["variants"]
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

  const onSubmit = (data: z.infer<typeof menuItemFormSchema>) => {
    form.clearErrors("translations")

    const selectedTranslation =
      selectedTranslationIndex >= 0
        ? data.translations?.[selectedTranslationIndex]
        : undefined
    let selectedTranslationPayload:
      | z.infer<typeof menuItemTranslationSchema>
      | undefined

    if (selectedTranslation) {
      const parsedTranslation =
        menuItemTranslationSchema.safeParse(selectedTranslation)

      if (!parsedTranslation.success) {
        setActiveTab("translations")
        setSelectedLocale(selectedTranslation.locale)

        for (const issue of parsedTranslation.error.issues) {
          const fieldName = issue.path[0]

          if (fieldName === "name" || fieldName === "description") {
            form.setError(
              `translations.${selectedTranslationIndex}.${fieldName}`,
              {
                type: "manual",
                message: issue.message
              }
            )
          }
        }

        toast.error("Revisa la traducción activa antes de guardar")
        return
      }

      selectedTranslationPayload = parsedTranslation.data
    }

    // Ensure price is a number before submitting
    if (data.variants) {
      const mapped = data.variants.map(variant => ({
        ...variant,
        price: Number(variant.price)
      }))
      // menuItemSchema may type variants as a non-empty tuple; assert to the expected type
      data.variants = mapped as unknown as z.infer<
        typeof menuItemFormSchema
      >["variants"]
    }

    execute({
      ...data,
      translations: selectedTranslationPayload
        ? [selectedTranslationPayload]
        : undefined
    })
  }

  const onInvalidSubmit = (
    errors: FieldErrors<z.infer<typeof menuItemFormSchema>>
  ) => {
    const issues = collectValidationIssues(errors, getTabForIssuePath)
    const firstIssue = issues[0]

    if (!firstIssue) {
      toast.error("Revisa los campos marcados antes de guardar")
      return
    }

    setActiveTab(firstIssue.tab)

    if (firstIssue.path.startsWith("translations.")) {
      const [, indexText] = firstIssue.path.split(".")
      const translation = availableTranslations[Number(indexText)]
      if (translation?.locale) {
        setSelectedLocale(translation.locale)
      }
    }

    toast.error("Revisa los errores del formulario antes de guardar")
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
      <form onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}>
        <div
          className="border-border bg-background sticky top-18 z-10 flex
            items-center justify-between rounded-xl border px-4 py-3 shadow-xs
            group-[.is-dialog]:top-0"
        >
          <h4>{title}</h4>
          <div>
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
                {status === "executing" && (
                  <Loader className="mr-2 size-4 animate-spin" />
                )}
                <TextMorph>
                  {status === "executing" ? "Guardando" : "Guardar"}
                </TextMorph>
              </Button>
            </div>
          </div>
        </div>

        {form.formState.submitCount > 0 && validationIssues.length > 0 && (
          <Alert variant="warning" className="mt-6">
            <TriangleAlert className="size-4" />
            <AlertTitle>No se pudo guardar el producto</AlertTitle>
            <AlertDescription>
              <div className="flex flex-col gap-2 text-sm">
                <p className="text-pretty">
                  Corrige los campos marcados antes de volver a guardar.
                </p>
                <ul className="list-disc pl-5">
                  {validationIssues.slice(0, 5).map(issue => (
                    <li key={`${issue.path}-${issue.message}`}>
                      {getIssueLabel(issue.path)}: {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onValueChange={value => setActiveTab(value as FormTab)}
          className="mt-10 gap-6"
        >
          <TabsList>
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="translations">Traducciones</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <FieldGroup>
              <div
                className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3"
              >
                <FieldSet className="lg:col-span-2">
                  <FieldLegend>Detalles del Producto</FieldLegend>
                  <FieldGroup>
                    <Controller
                      name="name"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid || undefined}>
                          <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                          <Input
                            {...field}
                            id={field.name}
                            aria-invalid={fieldState.invalid || undefined}
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
                        <Field data-invalid={fieldState.invalid || undefined}>
                          <FieldLabel htmlFor={field.name}>
                            Descripción
                          </FieldLabel>
                          <Textarea
                            {...field}
                            id={field.name}
                            aria-invalid={fieldState.invalid || undefined}
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
              <FieldSeparator />
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
                          Cambia el estado del producto para mostrarlo u
                          ocultarlo en el menú
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
                      <div className="flex items-center gap-2">
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
                          <ComboboxTrigger className="min-w-75" />
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
                            aria-label="Limpiar categoría"
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
                          setValue={(v: string) =>
                            form.setValue("allergens", v)
                          }
                        >
                          <TagsTrigger placeholder="Buscar alérgenos o indicadores">
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
                            <TagsInput placeholder="Buscar alérgenos o indicadores" />
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
          </TabsContent>

          <TabsContent value="translations">
            <FieldSet>
              <FieldLegend>Traducciones disponibles</FieldLegend>
              <FieldDescription className="text-pretty">
                Selecciona un idioma existente para editar el título y la
                descripción que verán tus clientes en esa versión del menú.
              </FieldDescription>
              {availableTranslations.length > 0 ? (
                <FieldGroup className="md:max-w-xl">
                  <Field>
                    <FieldLabel htmlFor="translation-locale">Idioma</FieldLabel>
                    <Select
                      value={activeLocale}
                      onValueChange={value =>
                        setSelectedLocale(value as SupportedLocaleCode)
                      }
                    >
                      <SelectTrigger id="translation-locale" className="w-full">
                        <SelectValue placeholder="Selecciona un idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {availableTranslations.map(translation => (
                            <SelectItem
                              key={translation.locale}
                              value={translation.locale}
                            >
                              <span className="flex items-center gap-2">
                                <LanguageFlag locale={translation.locale} />
                                <span>
                                  {getLocaleLabel(translation.locale)}
                                </span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldDescription className="text-pretty">
                      Solo puedes editar idiomas que ya existen. Agrega nuevos
                      idiomas desde la sección de traducciones del menú.
                    </FieldDescription>
                  </Field>

                  {selectedTranslationIndex >= 0 && (
                    <>
                      <Controller
                        name={
                          `translations.${selectedTranslationIndex}.name` as const
                        }
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid || undefined}>
                            <FieldLabel htmlFor={field.name}>
                              Título traducido
                            </FieldLabel>
                            <Input
                              {...field}
                              id={field.name}
                              aria-invalid={fieldState.invalid || undefined}
                              placeholder={`Nombre en ${getLocaleLabel(activeLocale)}`}
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                      <Controller
                        name={
                          `translations.${selectedTranslationIndex}.description` as const
                        }
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid || undefined}>
                            <FieldLabel htmlFor={field.name}>
                              Descripción traducida
                            </FieldLabel>
                            <Textarea
                              {...field}
                              id={field.name}
                              value={field.value ?? ""}
                              aria-invalid={fieldState.invalid || undefined}
                              placeholder={`Descripción en ${getLocaleLabel(activeLocale)}`}
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </>
                  )}
                </FieldGroup>
              ) : (
                <Empty
                  className="border-border bg-muted/20 items-start rounded-xl
                    border text-left"
                >
                  <EmptyHeader className="items-start text-left">
                    <EmptyMedia variant="icon">
                      <Languages />
                    </EmptyMedia>
                    <EmptyTitle className="text-balance">
                      Sin traducciones para editar
                    </EmptyTitle>
                    <EmptyDescription className="text-pretty">
                      Agrega un idioma desde la sección de traducciones del menú
                      para editar aquí el título y la descripción de esa
                      versión.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent className="items-start">
                    <Button asChild variant="outline">
                      <Link href="/dashboard/menu-items/translations">
                        <Languages data-icon="inline-start" />
                        Administrar traducciones
                      </Link>
                    </Button>
                  </EmptyContent>
                </Empty>
              )}
            </FieldSet>
          </TabsContent>
        </Tabs>
      </form>
      <MenuSyncDialog
        open={syncPrompt.open}
        onOpenChange={open =>
          setSyncPrompt(prev => ({ ...prev, open, rememberChoice: false }))
        }
        rememberChoice={syncPrompt.rememberChoice}
        onRememberChoiceChange={checked =>
          setSyncPrompt(prev => ({ ...prev, rememberChoice: checked }))
        }
        onCancel={() => handleSyncChoice(false)}
        onConfirm={() => handleSyncChoice(true)}
        isLoading={statusSyncMenus === "executing"}
      />
      <VariantCreate
        menuItemId={item.id}
        open={openVariant}
        setOpen={setOpenVariant}
      />
      {/* <DevTool control={form.control} /> */}
    </div>
  )
}
