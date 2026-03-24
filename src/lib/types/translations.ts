export const SUPPORTED_LOCALES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" }
] as const

export type SupportedLocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"]

export const SUPPORTED_LOCALE_CODES = SUPPORTED_LOCALES.map(
  l => l.code
) as unknown as readonly [SupportedLocaleCode, ...SupportedLocaleCode[]]
