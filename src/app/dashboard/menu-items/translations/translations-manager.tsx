"use client"

import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
import { DistortionWave } from "distortion-waves"
import { Ring } from "loading-dev"
import {
  Check,
  Crown,
  Languages,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  locale: SupportedLocaleCode
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
  const [completedCount, setCompletedCount] = useState<number | null>(null)
  // The action callbacks can outlive the dialog, so they read the latest value.
  const dialogOpenRef = useRef(false)
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

      const { locale, count = 0 } = response.data?.success ?? {}

      resetTranslate()
      router.refresh()
      setTranslatingLocale(null)

      // With the dialog open the wave is the reward; otherwise fall back to a toast.
      if (dialogOpenRef.current) {
        setCompletedCount(count)
        return
      }

      toast.success(
        `${count} producto${count !== 1 ? "s" : ""} traducido${count !== 1 ? "s" : ""} al ${getLocaleLabel(locale)}`
      )
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

  // Keep the chosen locale listed while it is being added (or just was), so
  // the select doesn't go blank under the wave.
  const translateSelectLocales =
    (isTranslating || completedCount !== null) &&
    selectedLocale &&
    !availableToAdd.some(locale => locale.code === selectedLocale)
      ? [
          {
            code: selectedLocale,
            label:
              SUPPORTED_LOCALES.find(locale => locale.code === selectedLocale)
                ?.label ?? getLocaleLabel(selectedLocale)
          },
          ...availableToAdd
        ]
      : availableToAdd

  const handleDialogOpenChange = (open: boolean) => {
    dialogOpenRef.current = open
    setDialogOpen(open)
    if (open || isTranslating) return
    setCompletedCount(null)
    setSelectedLocale("")
  }

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
        {(availableToAdd.length > 0 || dialogOpen) && (
          <PageSubtitle.Actions>
            <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
              <Button
                variant="default"
                className="gap-2"
                onClick={() =>
                  guardTranslation(() => handleDialogOpenChange(true))
                }
              >
                <PlusCircle className="size-4" />
                Agregar idioma
              </Button>
              <DialogContent
                className="gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-sm"
              >
                <TranslateLanguageWave
                  locales={translateSelectLocales}
                  selectedLocale={selectedLocale}
                  selectedLabel={getLocaleLabel(selectedLocale)}
                  isTranslating={isTranslating}
                  completedCount={completedCount}
                  onSelectLocale={setSelectedLocale}
                  onTranslate={handleTranslate}
                  onDone={() => handleDialogOpenChange(false)}
                />
              </DialogContent>
            </Dialog>
          </PageSubtitle.Actions>
        )}
      </PageSubtitle>

      {!isPro && availableToAdd.length > 0 && (
        <Banner
          inset
          className="bg-background text-foreground border-border border"
        >
          <BannerIcon icon={Crown} className="text-amber-500" />
          <BannerTitle>
            La traducción automática de productos requiere el plan Pro.
            Actualiza para agregar idiomas al menú.
          </BannerTitle>
          <BannerAction asChild>
            <Link
              href="/dashboard/settings/billing"
              prefetch={false}
              className="hover:text-foreground"
            >
              Actualizar a Pro
            </Link>
          </BannerAction>
          <BannerClose aria-label="Cerrar aviso" />
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
          <Empty className="border-border bg-muted/20 rounded-xl border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Languages />
              </EmptyMedia>
              <EmptyTitle>Empieza con un idioma</EmptyTitle>
              <EmptyDescription>
                No hay traducciones disponibles. Agrega un idioma para empezar.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
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
                        <Ring size={16} />
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
                        <Ring size={16} />
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

type TranslateLanguageWaveProps = {
  locales: { code: string; label: string }[]
  selectedLocale: string
  selectedLabel: string
  isTranslating: boolean
  completedCount: number | null
  onSelectLocale: (locale: string) => void
  onTranslate: () => void
  onDone: () => void
}

// The wave only plays once the translation has finished, as the reward. The
// action button lives in the overlay so it stays sharp while the wave passes,
// which is why both views reserve its height as bottom padding.
function TranslateLanguageWave({
  locales,
  selectedLocale,
  selectedLabel,
  isTranslating,
  completedCount,
  onSelectLocale,
  onTranslate,
  onDone
}: TranslateLanguageWaveProps) {
  const iconBadge = useRef<HTMLSpanElement>(null)
  const actionButton = useRef<HTMLButtonElement>(null)
  const isDone = completedCount !== null

  // The button is disabled while translating, so hand focus back once done.
  useEffect(() => {
    if (isDone) actionButton.current?.focus()
  }, [isDone])

  return (
    <DistortionWave
      className="overflow-hidden rounded-3xl"
      type="center"
      // sRGB equivalent of Tailwind's bg-emerald-500; the wave expects hex.
      palette="#00bb7f"
      revealed={isDone}
      source={iconBadge}
      revealedContent={
        <div
          role="status"
          className="bg-background flex h-full flex-col gap-6 p-6 pb-24"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <span
              className="mb-2 flex size-12 items-center justify-center
                rounded-full bg-emerald-500 text-white"
            >
              <Check className="size-6" strokeWidth={3} />
            </span>
            <p className="text-2xl leading-8 font-semibold">Traducción lista</p>
            <p className="text-muted-foreground text-sm">
              Tu menú ya tiene traducción al {selectedLabel}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div
              className="border-input flex h-9 items-center gap-2 rounded-md
                border px-3 text-sm"
            >
              {selectedLocale && <LanguageFlag locale={selectedLocale} />}
              <span>
                {locales.find(locale => locale.code === selectedLocale)
                  ?.label ?? selectedLabel}
              </span>
            </div>
            <ChecklistCard
              rows={[
                `${completedCount ?? 0} producto${completedCount === 1 ? "" : "s"} traducido${completedCount === 1 ? "" : "s"}`,
                "Variantes y categorías incluidas",
                "Actualízala cuando cambie tu menú"
              ]}
            />
          </div>
        </div>
      }
      overlay={
        <div className="absolute inset-x-0 bottom-0 p-6">
          <Button
            ref={actionButton}
            size="lg"
            className="w-full text-base"
            onClick={isDone ? onDone : onTranslate}
            disabled={isDone ? false : !selectedLocale || isTranslating}
          >
            {isTranslating ? (
              <Ring size={16} />
            ) : isDone ? null : (
              <Sparkles className="size-4 fill-current" />
            )}
            <TextMorph>
              {isDone
                ? "Listo"
                : isTranslating
                  ? "Traduciendo..."
                  : "Traducir con IA"}
            </TextMorph>
          </Button>
        </div>
      }
    >
      <div className="bg-background flex h-full flex-col gap-6 p-6 pb-24">
        <DialogHeader className="items-center text-center sm:text-center">
          <span
            ref={iconBadge}
            className="bg-muted text-muted-foreground mb-2 flex size-12
              items-center justify-center rounded-full"
          >
            <Languages className="size-5" />
          </span>
          <DialogTitle className="text-2xl leading-8">
            Traducir menú con IA
          </DialogTitle>
          <DialogDescription className="text-pretty">
            Elige el idioma para los productos de tu menú
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Select
            value={selectedLocale}
            onValueChange={onSelectLocale}
            disabled={isTranslating}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un idioma" />
            </SelectTrigger>
            <SelectContent>
              {locales.map(locale => (
                <SelectItem key={locale.code} value={locale.code}>
                  <span className="flex items-center gap-2">
                    <LanguageFlag locale={locale.code} />
                    <span>{locale.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ChecklistCard
            rows={[
              "Productos activos de tu menú",
              "Variantes y categorías incluidas",
              "Actualízala cuando cambie tu menú"
            ]}
          />
        </div>
      </div>
    </DistortionWave>
  )
}

function ChecklistCard({ rows }: { rows: string[] }) {
  return (
    <ul className="bg-muted divide-border divide-y rounded-2xl border px-4">
      {rows.map(row => (
        <li key={row} className="flex items-center gap-3 py-3 text-sm">
          <span
            className="bg-background flex size-6 shrink-0 items-center
              justify-center rounded-full"
          >
            <Check className="size-3.5" />
          </span>
          {row}
        </li>
      ))}
    </ul>
  )
}
