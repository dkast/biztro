"use client"

import { Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "@/components/menu-editor/translation-provider"
import { cn } from "@/lib/utils"

type LanguageSwitcherProps = {
  color?: string
}

export default function LanguageSwitcher({ color }: LanguageSwitcherProps) {
  const translation = useTranslation()

  if (!translation || translation.availableLocales.length === 0) {
    return null
  }

  const { locale, setLocale, availableLocales } = translation

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 rounded-full px-3"
          style={color ? { color } : undefined}
          aria-label="Cambiar idioma"
        >
          <Globe className="size-4" />
          <span className="text-xs font-medium uppercase">
            {locale ?? "ES"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={() => setLocale(null)}
          className={cn(!locale && "font-semibold")}
        >
          Español (original)
        </DropdownMenuItem>
        {availableLocales.map(l => (
          <DropdownMenuItem
            key={l.code}
            onSelect={() => setLocale(l.code)}
            className={cn(locale === l.code && "font-semibold")}
          >
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
