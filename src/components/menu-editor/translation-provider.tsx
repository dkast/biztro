"use client"

import { createContext, useCallback, useContext, type ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import { parseAsString, useQueryState } from "nuqs"

import { getUILabels, type UILabelKey } from "@/lib/ui-labels"

type TranslationMap = Record<
  string,
  { name: string; description?: string | null }
>

type TranslationsData = {
  items: TranslationMap
  variants: TranslationMap
  categories: TranslationMap
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
  getCategoryTranslation: (categoryId: string) => { name: string } | null
  t: (key: UILabelKey, vars?: Record<string, string>) => string
}

const TranslationContext = createContext<TranslationContextValue | null>(null)

type TranslationProviderProps = {
  children: ReactNode
  subdomain: string
  availableLocales: Array<{ code: string; label: string }>
}

type TranslationsQueryKey = readonly ["translations", string, string | null]

export function TranslationProvider({
  children,
  subdomain,
  availableLocales
}: TranslationProviderProps) {
  const [locale, setLocaleParam] = useQueryState(
    "lang",
    parseAsString.withDefault("")
  )

  const activeLocale = locale || null

  const translationsQuery = useQuery<
    TranslationsData,
    Error,
    TranslationsData,
    TranslationsQueryKey
  >({
    queryKey: ["translations", subdomain, activeLocale] as const,
    queryFn: async ({ queryKey }): Promise<TranslationsData> => {
      const [, currentSubdomain, currentLocale] = queryKey

      if (!currentLocale) throw new Error("Locale is required")

      const res = await fetch(
        `/api/public/translations?subdomain=${encodeURIComponent(currentSubdomain)}&locale=${encodeURIComponent(currentLocale)}`
      )
      if (!res.ok) throw new Error("Failed to fetch translations")
      return res.json() as Promise<TranslationsData>
    },
    enabled: !!activeLocale,
    staleTime: 5 * 60 * 1000
  })

  const translations = activeLocale ? (translationsQuery.data ?? null) : null
  const isLoading = !!activeLocale && translationsQuery.isLoading

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

  const getCategoryTranslation = useCallback(
    (categoryId: string) => {
      const entry = translations?.categories[categoryId]
      return entry ? { name: entry.name } : null
    },
    [translations]
  )

  const t = useCallback(
    (key: UILabelKey, vars?: Record<string, string>) => {
      return getUILabels(activeLocale)(key, vars)
    },
    [activeLocale]
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
        getVariantTranslation,
        getCategoryTranslation,
        t
      }}
    >
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  return useContext(TranslationContext)
}
