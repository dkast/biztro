"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
import { Loader, Plus, Sparkles, Trash2 } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { TextMorph } from "torph/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle
} from "@/components/ui/item"
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
}

export default function TranslationsManager({
  availableTranslations: initialTranslations
}: TranslationsManagerProps) {
  const [translations, setTranslations] =
    useState<AvailableTranslation[]>(initialTranslations)
  const [selectedLocale, setSelectedLocale] = useState<string>("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [translatingLocale, setTranslatingLocale] = useState<string | null>(
    null
  )
  const [deletingLocale, setDeletingLocale] = useState<string | null>(null)

  const existingLocales = new Set(translations.map(t => t.locale))
  const availableToAdd = SUPPORTED_LOCALES.filter(
    l => !existingLocales.has(l.code)
  )

  const { execute: executeTranslate, isPending: isTranslating } = useAction(
    translateMenuItems,
    {
      onSuccess: response => {
        if (response.data?.failure) {
          toast.error(response.data.failure.reason)
          setTranslatingLocale(null)
          return
        }
        const { locale, count } = response.data?.success ?? {}
        const localeName =
          SUPPORTED_LOCALES.find(l => l.code === locale)?.label ?? locale
        toast.success(
          `${count} producto${count !== 1 ? "s" : ""} traducido${count !== 1 ? "s" : ""} al ${localeName}`
        )
        if (locale) {
          setTranslations(prev => {
            const exists = prev.find(t => t.locale === locale)
            if (exists) {
              return prev.map(t =>
                t.locale === locale ? { ...t, count: count ?? t.count } : t
              )
            }
            return [...prev, { locale, count: count ?? 0 }]
          })
        }
        setTranslatingLocale(null)
        setDialogOpen(false)
        setSelectedLocale("")
      },
      onError: error => {
        Sentry.captureException(error, { tags: { section: "translate-menu" } })
        toast.error("Error al traducir los productos")
        setTranslatingLocale(null)
      }
    }
  )

  const { execute: executeDelete, isPending: isDeleting } = useAction(
    deleteMenuTranslation,
    {
      onSuccess: response => {
        if (response.data?.failure) {
          toast.error(response.data.failure.reason)
          setDeletingLocale(null)
          return
        }
        const locale = deletingLocale
        const localeName =
          SUPPORTED_LOCALES.find(l => l.code === locale)?.label ?? locale
        toast.success(`Traducción al ${localeName} eliminada`)
        setTranslations(prev => prev.filter(t => t.locale !== locale))
        setDeletingLocale(null)
      },
      onError: error => {
        Sentry.captureException(error, {
          tags: { section: "delete-translation" }
        })
        toast.error("Error al eliminar la traducción")
        setDeletingLocale(null)
      }
    }
  )

  const handleTranslate = () => {
    if (!selectedLocale) return
    setTranslatingLocale(selectedLocale)
    executeTranslate({ locale: selectedLocale as SupportedLocaleCode })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Existing translations */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Idiomas disponibles</h3>
          {availableToAdd.length > 0 && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="size-4" />
                  Agregar idioma
                </Button>
              </DialogTrigger>
              <DialogContent>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableToAdd.map(locale => (
                        <SelectItem key={locale.code} value={locale.code}>
                          {locale.label}
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
                    className="bg-linear-to-r/oklch from-indigo-500 via-pink-500
                      to-orange-500"
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
          )}
        </div>

        {translations.length === 0 ? (
          <div
            className="text-muted-foreground rounded-lg border border-dashed
              p-8 text-center text-sm"
          >
            No hay traducciones disponibles. Agrega un idioma para empezar.
          </div>
        ) : (
          <ItemGroup>
            {translations.map(translation => {
              const localeInfo = SUPPORTED_LOCALES.find(
                l => l.code === translation.locale
              )
              return (
                <Item key={translation.locale} variant="outline">
                  <ItemContent>
                    <ItemTitle>
                      {localeInfo?.label ?? translation.locale}
                      <Badge variant="default">{translation.locale}</Badge>
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
                        <Sparkles className="size-4" />
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

      <p className="text-muted-foreground text-xs">
        Las traducciones están disponibles en el menú público. Los visitantes
        podrán cambiar el idioma desde el selector de idiomas.
      </p>
    </div>
  )
}
