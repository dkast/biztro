"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react"
import { parseAsString, useQueryState } from "nuqs"

import type { SUPPORTED_LOCALES } from "@/server/actions/item/translations"

type TranslationMap = Record<string, { name: string; description?: string | null }>

type TranslationsData = {
  items: TranslationMap
  variants: TranslationMap
}

type TranslationContextValue = {
  locale: string | null
  setLocale: (locale: string | null) => void
  translations: TranslationsData | null
  isLoading: boolean
  availableLocales: Array<{ code: string; label: string }>
  getItemTranslation: (
    itemId: string
  ) => { name: string; description?: string | null } | null
  getVariantTranslation: (
    variantId: string
  ) => { name: string; description?: string | null } | null
}

const TranslationContext = createContext<TranslationContextValue | null>(null)

type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

type TranslationProviderProps = {
  children: ReactNode
  subdomain: string
  availableLocales: Array<Pick<SupportedLocale, "code" | "label">>
}

export function TranslationProvider({
  children,
  subdomain,
  availableLocales
}: TranslationProviderProps) {
  const [locale, setLocaleParam] = useQueryState(
    "lang",
    parseAsString.withDefault("")
  )
  const [translations, setTranslations] = useState<TranslationsData | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(false)

  const activeLocale = locale || null

  useEffect(() => {
    if (!activeLocale) {
      setTranslations(null)
      return
    }

    setIsLoading(true)
    fetch(
      `/api/public/translations?subdomain=${encodeURIComponent(subdomain)}&locale=${encodeURIComponent(activeLocale)}`
    )
      .then(res => res.json())
      .then((data: TranslationsData) => {
        setTranslations(data)
        setIsLoading(false)
      })
      .catch(() => {
        setTranslations(null)
        setIsLoading(false)
      })
  }, [activeLocale, subdomain])

  const setLocale = useCallback(
    (newLocale: string | null) => {
      void setLocaleParam(newLocale ?? "")
    },
    [setLocaleParam]
  )

  const getItemTranslation = useCallback(
    (itemId: string) => {
      return translations?.items[itemId] ?? null
    },
    [translations]
  )

  const getVariantTranslation = useCallback(
    (variantId: string) => {
      return translations?.variants[variantId] ?? null
    },
    [translations]
  )

  return (
    <TranslationContext.Provider
      value={{
        locale: activeLocale,
        setLocale,
        translations,
        isLoading,
        availableLocales,
        getItemTranslation,
        getVariantTranslation
      }}
    >
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  return useContext(TranslationContext)
}
