"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
import {
  CircleFadingArrowUp,
  Languages,
  Loader,
  PlusCircle,
  Sparkles,
  Trash2
} from "lucide-react"
import { useOptimisticAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TextMorph } from "torph/react"

import InfoHelper from "@/components/dashboard/info-helper"
import PageSubtitle from "@/components/dashboard/page-subtitle"
import { useProGuard } from "@/components/dashboard/upgrade-dialog"
import {
  Banner,
  BannerAction,
  BannerClose,
  BannerIcon,
  BannerTitle
} from "@/components/kibo-ui/banner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle
} from "@/components/ui/item"
import { LanguageFlag } from "@/components/ui/language-flag"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  deleteMenuTranslation,
  translateMenuItems
} from "@/server/actions/item/translations"
import {
  SUPPORTED_LOCALES,
  type SupportedLocaleCode
} from "@/lib/types/translations"

type AvailableTranslation = {
  locale: string
  count: number
}

type TranslationsManagerProps = {
  availableTranslations: AvailableTranslation[]
  isPro: boolean
}

export default function TranslationsManager({
  availableTranslations: initialTranslations,
  isPro
}: TranslationsManagerProps) {
  const [selectedLocale, setSelectedLocale] = useState<string>("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [translatingLocale, setTranslatingLocale] = useState<string | null>(
    null
  )
  const [deletingLocale, setDeletingLocale] = useState<string | null>(null)
  const router = useRouter()

  type TranslationsState = {
    translations: AvailableTranslation[]
  }

  const spanishLanguageNames = new Intl.DisplayNames(["es"], {
    type: "language"
  })

  const { guard: guardTranslation, dialog: upgradeDialog } = useProGuard(
    isPro,
    {
      title: "Actualiza a Pro",
      description:
        "La traducción automática de productos está disponible solo en el plan Pro. Actualiza para agregar nuevos idiomas al menú."
    }
  )

  function getLocaleLabel(locale?: string | null) {
    if (!locale) return ""

    return spanishLanguageNames.of(locale) ?? locale
  }

  const {
    execute: executeTranslate,
    reset: resetTranslate,
    optimisticState: translateOptimisticState
  } = useOptimisticAction(translateMenuItems, {
    currentState: {
      translations: initialTranslations
    },
    updateFn: (state, { locale }) => {
      const existingTranslation = state.translations.find(
        translation => translation.locale === locale
      )

      const nextTranslations = existingTranslation
        ? state.translations.map(translation =>
            translation.locale === locale
              ? { ...translation, count: translation.count }
              : translation
          )
        : [...state.translations, { locale, count: 0 }]

      return {
        translations: nextTranslations
      }
    },
    onSuccess: (response: {
      data?: {
        failure?: { reason: string }
        success?: { locale?: string; count?: number }
      }
    }) => {
      if (response.data?.failure) {
        toast.error(response.data.failure.reason)
        resetTranslate()
        setTranslatingLocale(null)
        return
      }

      const { locale, count } = response.data?.success ?? {}
      const localeName = getLocaleLabel(locale)

      toast.success(
        `${count} producto${count !== 1 ? "s" : ""} traducido${count !== 1 ? "s" : ""} al ${localeName}`
      )
      resetTranslate()
      router.refresh()
      setTranslatingLocale(null)
      setDialogOpen(false)
      setSelectedLocale("")
    },
    onError: (error: unknown) => {
      Sentry.captureException(error, { tags: { section: "translate-menu" } })
      toast.error("Error al traducir los productos")
      resetTranslate()
      setTranslatingLocale(null)
    }
  })

  const {
    execute: executeDelete,
    reset: resetDelete,
    optimisticState: deleteOptimisticState
  } = useOptimisticAction(deleteMenuTranslation, {
    currentState: translateOptimisticState as TranslationsState,
    updateFn: (state, { locale }) => {
      return {
        translations: state.translations.filter(
          translation => translation.locale !== locale
        )
      }
    },
    onSuccess: (response: {
      data?: {
        failure?: { reason: string }
      }
    }) => {
      if (response.data?.failure) {
        toast.error(response.data.failure.reason)
        resetDelete()
        setDeletingLocale(null)
        return
      }

      const localeName = getLocaleLabel(deletingLocale)
      toast.success(`Traducción al ${localeName} eliminada`)
      resetDelete()
      router.refresh()
      setDeletingLocale(null)
    },
    onError: (error: unknown) => {
      Sentry.captureException(error, {
        tags: { section: "delete-translation" }
      })
      toast.error("Error al eliminar la traducción")
      resetDelete()
      setDeletingLocale(null)
    }
  })

  const translations = deleteOptimisticState.translations

  const existingLocales = new Set(translations.map(t => t.locale))
  const availableToAdd = SUPPORTED_LOCALES.filter(
    l => !existingLocales.has(l.code)
  )

  const isTranslating = translatingLocale !== null
  const isDeleting = deletingLocale !== null

  const translateSelectLocales =
    isTranslating && selectedLocale
      ? [
          {
            code: selectedLocale,
            label: `${getLocaleLabel(selectedLocale)} (traduciendo)`
          },
          ...availableToAdd.filter(locale => locale.code !== selectedLocale)
        ]
      : availableToAdd

  const handleTranslate = () => {
    if (!selectedLocale) return
    setTranslatingLocale(selectedLocale)
    executeTranslate({ locale: selectedLocale as SupportedLocaleCode })
  }

  return (
    <div className="flex flex-col gap-10">
      <PageSubtitle>
        <PageSubtitle.Icon icon={Languages} />
        <PageSubtitle.Title>Traducciones del Menú</PageSubtitle.Title>
        <PageSubtitle.Description>
          Genera traducciones de tus productos con IA para mostrar el menú en
          otros idiomas
        </PageSubtitle.Description>
        {availableToAdd.length > 0 && (
          <PageSubtitle.Actions>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <Button
                variant="default"
                className="gap-2"
                onClick={() => guardTranslation(() => setDialogOpen(true))}
              >
                <PlusCircle className="size-4" />
                Agregar idioma
              </Button>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Traducir menú con IA</DialogTitle>
                  <DialogDescription>
                    Selecciona el idioma al que quieres traducir todos los
                    productos activos de tu menú.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                  <Select
                    value={selectedLocale}
                    onValueChange={setSelectedLocale}
                    disabled={isTranslating}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          isTranslating && selectedLocale
                            ? `${getLocaleLabel(selectedLocale)} (traduciendo)`
                            : "Selecciona un idioma"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {translateSelectLocales.map(locale => (
                        <SelectItem key={locale.code} value={locale.code}>
                          <span className="flex items-center gap-2">
                            <LanguageFlag locale={locale.code} />
                            <span>{locale.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false)
                      setSelectedLocale("")
                    }}
                    disabled={isTranslating}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleTranslate}
                    disabled={!selectedLocale || isTranslating}
                    className="bg-linear-65/oklch from-orange-500 to-indigo-500"
                  >
                    {isTranslating ? (
                      <Loader className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4 fill-current" />
                    )}
                    <TextMorph>
                      {isTranslating ? "Traduciendo..." : "Traducir con IA"}
                    </TextMorph>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PageSubtitle.Actions>
        )}
      </PageSubtitle>

      {!isPro && availableToAdd.length > 0 && (
        <Banner
          inset
          className="bg-linear-to-r/oklch from-indigo-500 to-pink-500
            text-white"
        >
          <BannerIcon
            icon={CircleFadingArrowUp}
            className="border-white/20 bg-white/10 text-white"
          />
          <BannerTitle>
            La traducción automática de productos requiere el plan Pro.
            Actualiza para agregar idiomas al menú.
          </BannerTitle>
          <BannerAction
            asChild
            className="border-white/20 bg-white/10 text-white hover:bg-white/20
              hover:text-white"
          >
            <Link href="/dashboard/settings/billing">Actualizar a Pro</Link>
          </BannerAction>
          <BannerClose
            aria-label="Cerrar aviso"
            className="text-white hover:bg-white/20 hover:text-white"
          />
        </Banner>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <h2 className="text-base leading-5 font-semibold">
              Idiomas disponibles
            </h2>
            <InfoHelper>
              Las traducciones están disponibles en el menú público. Los
              visitantes podrán cambiar el idioma desde el selector de idiomas.
            </InfoHelper>
          </div>
        </div>

        {translations.length === 0 ? (
          <Card>
            <CardContent className="pt-0">
              <Empty className="border-0 p-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Languages className="size-5" />
                  </EmptyMedia>
                  <EmptyTitle>Empieza con un idioma</EmptyTitle>
                  <EmptyDescription>
                    No hay traducciones disponibles. Agrega un idioma para
                    empezar.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </CardContent>
          </Card>
        ) : (
          <ItemGroup className="gap-4">
            {translations.map(translation => {
              const localeInfo = SUPPORTED_LOCALES.find(
                l => l.code === translation.locale
              )
              return (
                <Item key={translation.locale} variant="outline">
                  <ItemContent>
                    <ItemTitle>
                      <LanguageFlag locale={translation.locale} />
                      {localeInfo?.label ?? translation.locale}
                    </ItemTitle>
                    <ItemDescription>
                      {translation.count} producto
                      {translation.count !== 1 ? "s" : ""} traducido
                      {translation.count !== 1 ? "s" : ""}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      disabled={isTranslating || isDeleting}
                      onClick={() => {
                        setTranslatingLocale(translation.locale)
                        executeTranslate({
                          locale: translation.locale as SupportedLocaleCode
                        })
                      }}
                    >
                      {translatingLocale === translation.locale ? (
                        <Loader className="size-4 animate-spin" />
                      ) : (
                        <Sparkles className="size-4 fill-current" />
                      )}
                      Actualizar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isDeleting || isTranslating}
                      onClick={() => {
                        setDeletingLocale(translation.locale)
                        executeDelete({ locale: translation.locale })
                      }}
                      aria-label={`Eliminar traducción al ${localeInfo?.label ?? translation.locale}`}
                    >
                      {deletingLocale === translation.locale ? (
                        <Loader className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </ItemActions>
                </Item>
              )
            })}
          </ItemGroup>
        )}
      </div>

      {upgradeDialog}
    </div>
  )
}
