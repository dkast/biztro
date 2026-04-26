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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
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
import { Switch } from "@/components/ui/switch"
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
  menuItemTranslationSchema,
  variantTranslationSchema
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
  return path.startsWith("translations.") || path.includes(".translations.")
    ? "translations"
    : "details"
}

function getMenuItemStatusMeta(status: MenuItemStatus) {
  switch (status) {
    case MenuItemStatus.ACTIVE:
      return {
        label: "Activo",
        variant: "green",
        description: "Visible para mostrarse en los menús activos."
      } as const
    case MenuItemStatus.ARCHIVED:
      return {
        label: "Archivado",
        variant: "secondary",
        description: "Fuera de circulación, pero conservado para referencia."
      } as const
    case MenuItemStatus.DRAFT:
    default:
      return {
        label: "Borrador",
        variant: "yellow",
        description: "Todavía no se muestra a clientes hasta publicarlo."
      } as const
  }
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
        menuItemId: variant.menuItemId ?? "",
        translations: (variant.translations ?? []).map(translation => ({
          locale: translation.locale as SupportedLocaleCode,
          name: translation.name ?? "",
          description: translation.description ?? ""
        }))
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
  >(() => {
    const itemLocale = item?.translations?.[0]?.locale as
      | SupportedLocaleCode
      | undefined
    const variantLocale = item?.variants?.flatMap(
      variant => variant.translations ?? []
    )[0]?.locale as SupportedLocaleCode | undefined

    return itemLocale ?? variantLocale ?? ""
  })
  const [syncPrompt, setSyncPrompt] = useState({
    open: false,
    organizationId: item?.organizationId ?? "",
    rememberChoice: false
  })

  const { fields } = useFieldArray({
    control: form.control,
    name: "variants"
  })
  const currentStatus = useWatch({
    control: form.control,
    name: "status"
  })
  const currentCategoryId = useWatch({
    control: form.control,
    name: "categoryId"
  })
  const translations = useWatch({
    control: form.control,
    name: "translations"
  })
  const variants = useWatch({
    control: form.control,
    name: "variants"
  })

  const availableTranslations = translations ?? []
  const availableLocales = Array.from(
    new Set([
      ...availableTranslations.map(translation => translation.locale),
      ...(variants ?? []).flatMap(variant =>
        (variant.translations ?? []).map(translation => translation.locale)
      )
    ])
  ).sort() as SupportedLocaleCode[]
  const fallbackLocale = availableLocales[0] ?? ""
  const activeLocale =
    selectedLocale && availableLocales.includes(selectedLocale)
      ? selectedLocale
      : fallbackLocale
  const selectedTranslationIndex = availableTranslations.findIndex(
    translation => translation.locale === activeLocale
  )
  const variantTranslationEntries = (variants ?? []).flatMap(
    (variant, index) => {
      const translationIndex = (variant.translations ?? []).findIndex(
        translation => translation.locale === activeLocale
      )

      if (translationIndex < 0) {
        return []
      }

      return [
        {
          variantIndex: index,
          translationIndex,
          variantName: variant.name || `Variante ${index + 1}`
        }
      ]
    }
  )
  const localeOptions = availableLocales.map(locale => ({
    locale,
    label: getLocaleLabel(locale),
    hasItemTranslation: availableTranslations.some(
      translation => translation.locale === locale
    ),
    translatedVariantsCount: (variants ?? []).reduce(
      (count, variant) =>
        count +
        ((variant.translations ?? []).some(
          translation => translation.locale === locale
        )
          ? 1
          : 0),
      0
    )
  }))
  const activeLocaleSummary = localeOptions.find(
    option => option.locale === activeLocale
  )
  const activeLocaleLabel =
    activeLocaleSummary?.label ?? getLocaleLabel(activeLocale)
  const activeVariantTranslationCount = variantTranslationEntries.length
  const inactiveVariantTranslationCount = Math.max(
    (variants?.length ?? 0) - activeVariantTranslationCount,
    0
  )
  const shouldShowVariantTranslationSection = (variants?.length ?? 0) > 1
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

    if (path.includes(".translations.")) {
      const [
        variantsKey,
        variantIndexText,
        translationsKey,
        translationIndexText,
        fieldName
      ] = path.split(".")

      if (variantsKey === "variants" && translationsKey === "translations") {
        const variant = variants?.[Number(variantIndexText)]
        const translation =
          variant?.translations?.[Number(translationIndexText)]
        const localeLabel = getLocaleLabel(translation?.locale)
        const variantLabel =
          variant?.name || `Variante ${Number(variantIndexText) + 1}`

        if (fieldName === "name") {
          return localeLabel
            ? `Variante ${variantLabel} (${localeLabel})`
            : `Variante ${variantLabel}`
        }

        if (fieldName === "description") {
          return localeLabel
            ? `Descripción de ${variantLabel} (${localeLabel})`
            : `Descripción de ${variantLabel}`
        }
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
        menuItemId: variant.menuItemId,
        translations: (variant.translations ?? []).map(translation => ({
          locale: translation.locale as SupportedLocaleCode,
          name: translation.name ?? "",
          description: translation.description ?? ""
        }))
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

  const categoryList = categories as Array<{ id: string; name: string }>
  const statusMeta = getMenuItemStatusMeta(
    (currentStatus ?? MenuItemStatus.DRAFT) as MenuItemStatus
  )
  const selectedCategoryName =
    categoryList.find(category => category.id === currentCategoryId)?.name ??
    "Sin categoría"
  const introCopy =
    action === "new"
      ? "Completa los datos principales y guarda el producto."
      : "Actualiza los datos del producto y guarda los cambios."
  const activeViewSummary =
    activeTab === "details"
      ? "Datos, visibilidad y organización del producto."
      : activeLocaleLabel
        ? `${activeLocaleLabel}: texto visible para el cliente.`
        : "Texto de los idiomas existentes."

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
    form.clearErrors("variants")

    const selectedTranslation =
      selectedTranslationIndex >= 0
        ? data.translations?.[selectedTranslationIndex]
        : undefined
    let selectedTranslationPayload:
      | z.infer<typeof menuItemTranslationSchema>
      | undefined
    const selectedVariantTranslationPayloads = [] as Array<{
      variantIndex: number
      translation: z.infer<typeof variantTranslationSchema>
    }>

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

    for (const entry of variantTranslationEntries) {
      const selectedVariantTranslation =
        data.variants?.[entry.variantIndex]?.translations?.[
          entry.translationIndex
        ]

      if (!selectedVariantTranslation) {
        continue
      }

      const parsedVariantTranslation = variantTranslationSchema.safeParse(
        selectedVariantTranslation
      )

      if (!parsedVariantTranslation.success) {
        setActiveTab("translations")
        setSelectedLocale(selectedVariantTranslation.locale)

        for (const issue of parsedVariantTranslation.error.issues) {
          const fieldName = issue.path[0]

          if (fieldName === "name" || fieldName === "description") {
            form.setError(
              `variants.${entry.variantIndex}.translations.${entry.translationIndex}.${fieldName}`,
              {
                type: "manual",
                message: issue.message
              }
            )
          }
        }

        toast.error("Revisa las traducciones de las variantes antes de guardar")
        return
      }

      selectedVariantTranslationPayloads.push({
        variantIndex: entry.variantIndex,
        translation: parsedVariantTranslation.data
      })
    }

    const variantsPayload = data.variants.map((variant, index) => {
      const selectedVariantTranslation =
        selectedVariantTranslationPayloads.find(
          translation => translation.variantIndex === index
        )

      return {
        id: variant.id,
        name: variant.name,
        price: Number(variant.price),
        description: variant.description,
        menuItemId: variant.menuItemId,
        translations: selectedVariantTranslation
          ? [selectedVariantTranslation.translation]
          : undefined
      }
    })

    const payload: Parameters<typeof execute>[0] = {
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status,
      image: data.image,
      categoryId: data.categoryId,
      organizationId: data.organizationId,
      featured: data.featured,
      allergens: data.allergens,
      currency: data.currency,
      updatePublishedMenus: data.updatePublishedMenus,
      rememberPublishedChoice: data.rememberPublishedChoice,
      variants: variantsPayload as Parameters<typeof execute>[0]["variants"],
      translations: selectedTranslationPayload
        ? [selectedTranslationPayload]
        : undefined
    }

    execute(payload)
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

    if (firstIssue.path.includes(".translations.")) {
      const [, variantIndexText, , translationIndexText] =
        firstIssue.path.split(".")
      const translation =
        variants?.[Number(variantIndexText)]?.translations?.[
          Number(translationIndexText)
        ]

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
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]"
      >
        <div className="min-w-0 space-y-6">
          <section
            className="border-border bg-background rounded-2xl border px-5 py-5
              shadow-xs sm:px-6 sm:py-6"
          >
            <div className="space-y-2">
              <h1
                className="font-display text-xl font-semibold tracking-tight
                  text-balance sm:text-2xl"
              >
                {title}
              </h1>
              <p
                className="text-muted-foreground max-w-3xl text-sm leading-6
                  text-pretty"
              >
                {introCopy}
              </p>
            </div>
          </section>

          {form.formState.submitCount > 0 && validationIssues.length > 0 && (
            <Alert variant="warning">
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
            className="space-y-6"
          >
            <div
              className="border-border bg-background sticky top-18 z-10
                rounded-2xl border px-4 py-4 shadow-xs group-[.is-dialog]:top-0
                sm:px-5"
            >
              <div
                className="flex flex-col gap-4 md:flex-row md:items-center
                  md:justify-between"
              >
                <div className="min-w-0 space-y-3">
                  <div
                    className="flex flex-col gap-3 md:flex-row md:items-center
                      md:justify-between"
                  >
                    <TabsList
                      className="bg-muted/40 grid w-full max-w-md grid-cols-2
                        rounded-xl p-1"
                    >
                      <TabsTrigger value="details" className="rounded-lg">
                        Detalles
                      </TabsTrigger>
                      <TabsTrigger value="translations" className="rounded-lg">
                        Traducciones
                      </TabsTrigger>
                    </TabsList>
                    <div
                      className="flex flex-wrap items-center justify-start gap-2
                        lg:justify-end"
                    >
                      {form.formState.isDirty && (
                        <span
                          aria-label="Cambios sin guardar"
                          title="Cambios sin guardar"
                          className="inline-block size-2 rounded-full
                            bg-yellow-500"
                        />
                      )}
                      {form.formState.submitCount > 0 &&
                        validationIssues.length > 0 && (
                          <Badge variant="destructive">
                            {validationIssues.length} pendiente
                            {validationIssues.length === 1 ? "" : "s"}
                          </Badge>
                        )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => router.back()}
                    ref={saveRef}
                  >
                    Cerrar
                  </Button>
                  <Button
                    disabled={status === "executing"}
                    size="sm"
                    type="submit"
                  >
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

            <TabsContent value="details" className="mt-0">
              <div className="space-y-6">
                <section
                  className="border-border bg-background rounded-2xl border px-5
                    py-5 shadow-xs sm:px-6"
                >
                  <div
                    className="grid gap-6
                      xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.85fr)]"
                  >
                    <FieldSet>
                      <FieldLegend>Detalles del producto</FieldLegend>
                      <FieldDescription className="text-pretty">
                        Nombre y descripción base.
                      </FieldDescription>
                      <FieldGroup>
                        <Controller
                          name="name"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field
                              data-invalid={fieldState.invalid || undefined}
                            >
                              <FieldLabel htmlFor={field.name}>
                                Nombre
                              </FieldLabel>
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
                            <Field
                              data-invalid={fieldState.invalid || undefined}
                            >
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
                      <FieldLegend>Imagen del producto</FieldLegend>
                      <FieldDescription className="text-pretty">
                        Imagen usada en el catálogo y el menú.
                      </FieldDescription>
                      <div className="h-full min-h-64">
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
                </section>

                <section
                  className="border-border bg-background rounded-2xl border px-5
                    py-5 shadow-xs sm:px-6"
                >
                  <FieldSet>
                    <FieldLegend>Disponibilidad y visibilidad</FieldLegend>
                    <FieldDescription className="text-pretty">
                      Estado, moneda y visibilidad del producto.
                    </FieldDescription>
                    <FieldContent
                      className="grid gap-0 divide-y xl:grid-cols-3 xl:divide-x
                        xl:divide-y-0"
                    >
                      <Controller
                        name="status"
                        control={form.control}
                        render={({ field }) => (
                          <FieldSet
                            className="flex h-full flex-col justify-center px-0
                              py-4 xl:px-5 xl:py-0"
                          >
                            <FieldLegend>Estatus del producto</FieldLegend>
                            <FieldDescription className="mt-2">
                              Activo, borrador o archivado.
                            </FieldDescription>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="mt-3">
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
                          </FieldSet>
                        )}
                      />
                      <Controller
                        name="currency"
                        control={form.control}
                        render={({ field }) => (
                          <FieldSet
                            className="flex h-full flex-col justify-center px-0
                              py-4 xl:px-5 xl:py-0"
                          >
                            <FieldLegend>Moneda</FieldLegend>
                            <FieldDescription className="mt-2">
                              Moneda visible para el cliente.
                            </FieldDescription>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="mt-3">
                                <SelectValue placeholder="Seleccionar moneda" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MXN">MXN</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                              </SelectContent>
                            </Select>
                          </FieldSet>
                        )}
                      />
                      <Controller
                        name="featured"
                        control={form.control}
                        render={({ field }) => (
                          <FieldSet
                            className="flex h-full flex-col justify-center px-0
                              py-4 xl:px-5 xl:py-0"
                          >
                            <div
                              className="flex items-start justify-between gap-4"
                            >
                              <div className="min-w-0 space-y-2">
                                <FieldLegend>Recomendado</FieldLegend>
                                <FieldDescription className="mt-2">
                                  Mostrar en recomendados.
                                </FieldDescription>
                              </div>

                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          </FieldSet>
                        )}
                      />
                    </FieldContent>
                  </FieldSet>
                </section>

                <div
                  className="grid gap-6
                    xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                >
                  <section
                    className="border-border bg-background rounded-2xl border
                      px-5 py-5 shadow-xs sm:px-6"
                  >
                    <FieldSet>
                      <FieldLegend>Variantes</FieldLegend>
                      <FieldDescription className="text-pretty">
                        Opciones como tamaño o presentación.
                      </FieldDescription>
                      <FieldGroup>
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
                  </section>

                  <section
                    className="border-border bg-background rounded-2xl border
                      px-5 py-5 shadow-xs sm:px-6"
                  >
                    <FieldSet>
                      <FieldLegend>Categoría</FieldLegend>
                      <FieldDescription className="text-pretty">
                        Agrupa este producto dentro del menú.
                      </FieldDescription>
                      <Controller
                        name="categoryId"
                        control={form.control}
                        render={({ field }) => (
                          <Field>
                            <div className="flex items-center gap-2">
                              <Combobox
                                data={categoryList.map(category => ({
                                  label: category.name,
                                  value: category.id
                                }))}
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
                                      {categoryList.map(category => (
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
                                      ))}
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
                  </section>
                </div>

                <section
                  className="border-border bg-background rounded-2xl border px-5
                    py-5 shadow-xs sm:px-6"
                >
                  <FieldSet>
                    <FieldLegend>Alérgenos e indicadores</FieldLegend>
                    <FieldDescription className="text-pretty">
                      Marca alergias o atributos especiales.
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
                                    {Allergens.find(a => a.value === val)
                                      ?.label ?? val}
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
                                          form.setValue(
                                            "allergens",
                                            next.join(",")
                                          )
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
                </section>
              </div>
            </TabsContent>

            <TabsContent value="translations" className="mt-0">
              <FieldSet className="space-y-4">
                <FieldLegend>Traducciones disponibles</FieldLegend>
                <FieldDescription className="text-pretty">
                  Edita los idiomas ya creados.
                </FieldDescription>
                {availableLocales.length > 0 ? (
                  <FieldGroup className="gap-6">
                    <div
                      className="grid gap-6
                        xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]"
                    >
                      <FieldSet
                        className="border-border bg-muted/20 rounded-xl border
                          p-4"
                      >
                        <FieldLegend>Idioma activo</FieldLegend>
                        <FieldDescription className="text-pretty">
                          Selecciona el idioma que quieres revisar.
                        </FieldDescription>
                        <FieldGroup>
                          <Field>
                            <FieldLabel htmlFor="translation-locale">
                              Idioma
                            </FieldLabel>
                            <Select
                              value={activeLocale}
                              onValueChange={value =>
                                setSelectedLocale(value as SupportedLocaleCode)
                              }
                            >
                              <SelectTrigger
                                id="translation-locale"
                                className="w-full"
                              >
                                <SelectValue placeholder="Selecciona un idioma" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {localeOptions.map(localeOption => (
                                    <SelectItem
                                      key={localeOption.locale}
                                      value={localeOption.locale}
                                    >
                                      <span
                                        className="flex w-full items-center
                                          justify-between gap-3"
                                      >
                                        <span
                                          className="flex items-center gap-2"
                                        >
                                          <LanguageFlag
                                            locale={localeOption.locale}
                                          />
                                          <span>{localeOption.label}</span>
                                        </span>
                                        <span
                                          className="text-muted-foreground
                                            text-xs"
                                        >
                                          {localeOption.hasItemTranslation
                                            ? "Producto"
                                            : "Sin producto"}
                                          {` · ${localeOption.translatedVariantsCount} variantes`}
                                        </span>
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            <FieldDescription className="text-pretty">
                              Los nuevos idiomas se agregan desde traducciones
                              del menú.
                            </FieldDescription>
                          </Field>

                          <div className="flex flex-wrap gap-2">
                            {shouldShowVariantTranslationSection && (
                              <Badge variant="indigo">
                                {activeVariantTranslationCount} variantes
                                editables
                              </Badge>
                            )}
                            {shouldShowVariantTranslationSection &&
                              inactiveVariantTranslationCount > 0 && (
                                <Badge variant="outline">
                                  {inactiveVariantTranslationCount} sin
                                  traducción aquí
                                </Badge>
                              )}
                          </div>
                        </FieldGroup>
                      </FieldSet>

                      <FieldSet className="border-border rounded-xl border p-4">
                        <FieldLegend>Texto del producto</FieldLegend>
                        <FieldDescription className="text-pretty">
                          Texto visible en {activeLocaleLabel || "este idioma"}.
                        </FieldDescription>
                        {selectedTranslationIndex >= 0 ? (
                          <FieldGroup
                            key={`product-translation-${activeLocale}`}
                          >
                            <Controller
                              name={
                                `translations.${selectedTranslationIndex}.name` as const
                              }
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <Field
                                  data-invalid={fieldState.invalid || undefined}
                                >
                                  <FieldLabel htmlFor={field.name}>
                                    Título traducido
                                  </FieldLabel>
                                  <Input
                                    {...field}
                                    id={field.name}
                                    aria-invalid={
                                      fieldState.invalid || undefined
                                    }
                                    placeholder={`Nombre en ${activeLocaleLabel}`}
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
                                <Field
                                  data-invalid={fieldState.invalid || undefined}
                                >
                                  <FieldLabel htmlFor={field.name}>
                                    Descripción traducida
                                  </FieldLabel>
                                  <Textarea
                                    {...field}
                                    id={field.name}
                                    value={field.value ?? ""}
                                    aria-invalid={
                                      fieldState.invalid || undefined
                                    }
                                    placeholder={`Descripción en ${activeLocaleLabel}`}
                                  />
                                  {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                  )}
                                </Field>
                              )}
                            />
                          </FieldGroup>
                        ) : (
                          <Alert>
                            <Languages className="size-4" />
                            <AlertTitle>Sin traducción del producto</AlertTitle>
                            <AlertDescription>
                              Este idioma todavía no tiene texto para este
                              producto.
                            </AlertDescription>
                          </Alert>
                        )}
                      </FieldSet>
                    </div>

                    {shouldShowVariantTranslationSection && (
                      <FieldSet className="border-border rounded-xl border p-4">
                        <div
                          className="flex flex-col gap-3 md:flex-row
                            md:items-start md:justify-between"
                        >
                          <div className="flex flex-col gap-1">
                            <FieldLegend>Traducciones de variantes</FieldLegend>
                            <FieldDescription className="text-pretty">
                              Variantes editables en este idioma.
                            </FieldDescription>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="indigo">
                              {activeVariantTranslationCount} editables
                            </Badge>
                            {inactiveVariantTranslationCount > 0 && (
                              <Badge variant="outline">
                                {inactiveVariantTranslationCount} pendientes en
                                otro idioma
                              </Badge>
                            )}
                          </div>
                        </div>
                        {variantTranslationEntries.length > 0 ? (
                          <Accordion
                            type="multiple"
                            className="border-border bg-background rounded-xl
                              border px-4"
                          >
                            {variantTranslationEntries.map(entry => {
                              const originalVariant =
                                variants?.[entry.variantIndex]
                              const originalDescription =
                                originalVariant?.description?.trim()

                              return (
                                <AccordionItem
                                  key={`${entry.variantIndex}-${entry.translationIndex}`}
                                  value={`${entry.variantIndex}-${entry.translationIndex}`}
                                  className="px-1"
                                >
                                  <AccordionTrigger
                                    className="gap-4 hover:no-underline"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <div
                                        className="flex flex-wrap items-center
                                          gap-2"
                                      >
                                        <span className="font-medium">
                                          {entry.variantName}
                                        </span>
                                      </div>
                                      <p
                                        className="text-muted-foreground mt-1
                                          text-sm text-pretty"
                                      >
                                        {originalDescription
                                          ? `Base: ${originalDescription}`
                                          : "Sin descripción base para esta variante."}
                                      </p>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <FieldGroup>
                                      <Controller
                                        name={
                                          `variants.${entry.variantIndex}.translations.${entry.translationIndex}.name` as const
                                        }
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                          <Field
                                            data-invalid={
                                              fieldState.invalid || undefined
                                            }
                                          >
                                            <FieldLabel htmlFor={field.name}>
                                              Nombre de la variante
                                            </FieldLabel>
                                            <Input
                                              {...field}
                                              id={field.name}
                                              aria-invalid={
                                                fieldState.invalid || undefined
                                              }
                                              placeholder={`Nombre en ${activeLocaleLabel}`}
                                            />
                                            {fieldState.invalid && (
                                              <FieldError
                                                errors={[fieldState.error]}
                                              />
                                            )}
                                          </Field>
                                        )}
                                      />
                                      <Controller
                                        name={
                                          `variants.${entry.variantIndex}.translations.${entry.translationIndex}.description` as const
                                        }
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                          <Field
                                            data-invalid={
                                              fieldState.invalid || undefined
                                            }
                                          >
                                            <FieldLabel htmlFor={field.name}>
                                              Descripción de la variante
                                            </FieldLabel>
                                            <Textarea
                                              {...field}
                                              id={field.name}
                                              value={field.value ?? ""}
                                              aria-invalid={
                                                fieldState.invalid || undefined
                                              }
                                              placeholder={`Descripción en ${activeLocaleLabel}`}
                                            />
                                            {fieldState.invalid && (
                                              <FieldError
                                                errors={[fieldState.error]}
                                              />
                                            )}
                                          </Field>
                                        )}
                                      />
                                    </FieldGroup>
                                  </AccordionContent>
                                </AccordionItem>
                              )
                            })}
                          </Accordion>
                        ) : (
                          <Alert>
                            <Languages className="size-4" />
                            <AlertTitle>
                              Sin traducciones de variantes
                            </AlertTitle>
                            <AlertDescription>
                              No hay variantes editables en
                              {` ${activeLocaleLabel || "este idioma"}`}.
                            </AlertDescription>
                          </Alert>
                        )}
                      </FieldSet>
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
                        Agrega un idioma en traducciones del menú para editarlo
                        aquí.
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
        </div>

        <aside
          className="hidden space-y-4 group-[.is-dialog]:top-0 lg:sticky
            lg:top-24 lg:block lg:self-start"
        >
          <section
            className="border-border bg-background rounded-2xl border px-5 py-5
              shadow-xs"
          >
            <FieldSet>
              <FieldLegend>Resumen operativo</FieldLegend>
              <FieldDescription className="text-pretty">
                Estado rápido del producto.
              </FieldDescription>
            </FieldSet>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Estado</dt>
                <dd>
                  <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Categoría</dt>
                <dd>
                  <Badge
                    variant="outline"
                    className="max-w-44 text-right text-pretty"
                  >
                    {selectedCategoryName}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Variantes</dt>
                <dd>
                  <Badge variant="secondary">
                    {fields.length > 0
                      ? `${fields.length} configurada${fields.length === 1 ? "" : "s"}`
                      : "Sin variantes"}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Cobertura</dt>
                <dd className="max-w-44 text-right font-medium text-pretty">
                  {availableLocales.length > 0
                    ? `${availableLocales.length} idioma${availableLocales.length === 1 ? "" : "s"}, ${activeVariantTranslationCount} variante${activeVariantTranslationCount === 1 ? "" : "s"} editables`
                    : "Sin traducciones cargadas"}
                </dd>
              </div>
            </dl>
          </section>

          <section
            className="border-border bg-muted/20 rounded-2xl border px-5 py-5
              shadow-xs"
          >
            <FieldSet>
              <FieldLegend>En esta vista</FieldLegend>
            </FieldSet>
            <p className="mt-3 text-sm font-medium text-pretty">
              {activeViewSummary}
            </p>
            <p className="text-muted-foreground mt-3 text-sm text-pretty">
              {activeTab === "details"
                ? "Guarda antes de crear una variante nueva."
                : "La validación te lleva al idioma con errores."}
            </p>
          </section>
        </aside>
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
