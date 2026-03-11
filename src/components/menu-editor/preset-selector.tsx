"use client"

import { useMemo, useState } from "react"
import { Check } from "lucide-react"

import FontWrapper from "@/components/menu-editor/font-wrapper"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  DrawerContent,
  DrawerHeader,
  DrawerNested,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  colorThemes as builtInColorThemes,
  fontThemes,
  themePresets,
  type ColorTheme,
  type ThemePreset
} from "@/lib/types/theme"
import { cn } from "@/lib/utils"

function PresetCard({
  preset,
  isActive,
  onClick,
  colorThemes
}: {
  preset: ThemePreset
  isActive: boolean
  onClick: () => void
  colorThemes: ColorTheme[]
}) {
  const font = fontThemes.find(f => f.name === preset.fontTheme)
  const color =
    colorThemes.find(c => c.id === preset.colorTheme) ??
    builtInColorThemes.find(c => c.id === preset.colorTheme)

  if (!font || !color) return null

  return (
    <button
      onClick={onClick}
      className={cn(
        `group relative w-full overflow-hidden rounded-lg border-2 text-left
        transition-colors`,
        isActive
          ? "border-indigo-500"
          : `border-gray-200 hover:border-gray-400 dark:border-gray-800
            dark:hover:border-gray-600`
      )}
    >
      {/* Mini menu preview */}
      <div
        className="flex flex-col gap-1.5 px-3 py-2.5"
        style={{ backgroundColor: color.surfaceColor }}
      >
        {/* Header mock */}
        <FontWrapper fontFamily={font.fontDisplay}>
          <span
            className="block truncate text-sm leading-tight font-semibold"
            style={{ color: color.brandColor }}
          >
            {preset.name}
          </span>
        </FontWrapper>
        {/* Divider */}
        <div
          className="h-px w-6"
          style={{ backgroundColor: color.accentColor }}
        />
        {/* Item mock rows */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <FontWrapper fontFamily={font.fontDisplay}>
              <span
                className="truncate text-xs leading-tight font-medium"
                style={{ color: color.textColor }}
              >
                Platillo
              </span>
            </FontWrapper>
            <FontWrapper fontFamily={font.fontText}>
              <span
                className="text-xs leading-tight tabular-nums"
                style={{ color: color.textColor }}
              >
                $120
              </span>
            </FontWrapper>
          </div>
          <FontWrapper fontFamily={font.fontText}>
            <span
              className="line-clamp-1 text-[10px] leading-tight"
              style={{ color: color.mutedColor }}
            >
              Descripción del platillo
            </span>
          </FontWrapper>
        </div>
        {/* Second item stub */}
        <div className="flex items-baseline justify-between">
          <FontWrapper fontFamily={font.fontDisplay}>
            <span
              className="truncate text-xs leading-tight font-medium"
              style={{ color: color.textColor }}
            >
              Entrada
            </span>
          </FontWrapper>
          <FontWrapper fontFamily={font.fontText}>
            <span
              className="text-xs leading-tight tabular-nums"
              style={{ color: color.textColor }}
            >
              $85
            </span>
          </FontWrapper>
        </div>
      </div>
      {/* Label strip */}
      <div
        className="border-t border-gray-200 bg-white px-3 py-1.5
          dark:border-gray-800 dark:bg-gray-950"
      >
        <span
          className="text-[10px] text-pretty text-gray-500 dark:text-gray-400"
        >
          {preset.description}
        </span>
      </div>
      {/* Active check */}
      {isActive && (
        <div
          className="absolute top-1.5 right-1.5 flex size-4 items-center
            justify-center rounded-full bg-indigo-500 text-white"
        >
          <Check className="size-2.5" />
        </div>
      )}
    </button>
  )
}

export default function PresetSelector({
  colorThemes,
  currentFontTheme,
  currentColorTheme,
  onSelect
}: {
  colorThemes: ColorTheme[]
  currentFontTheme: string
  currentColorTheme: string
  onSelect: (fontTheme: string, colorTheme: string) => void
}) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

  const activePresetId = useMemo(() => {
    const match = themePresets.find(
      p =>
        p.fontTheme === currentFontTheme && p.colorTheme === currentColorTheme
    )
    return match?.id ?? null
  }, [currentFontTheme, currentColorTheme])

  const handleSelect = (preset: ThemePreset) => {
    onSelect(preset.fontTheme, preset.colorTheme)
    setOpen(false)
  }

  const grid = (
    <div className="grid grid-cols-2 gap-2">
      {themePresets.map(preset => (
        <PresetCard
          key={preset.id}
          preset={preset}
          isActive={preset.id === activePresetId}
          onClick={() => handleSelect(preset)}
          colorThemes={colorThemes}
        />
      ))}
    </div>
  )

  const triggerButton = (
    <button
      className="flex w-full flex-row items-center justify-between rounded-lg
        border border-gray-200 px-4 py-2 text-left shadow-xs transition-colors
        dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800"
    >
      <span className="text-sm">
        {activePresetId
          ? themePresets.find(p => p.id === activePresetId)?.name
          : "Elegir tema"}
      </span>
      <span className="text-xs text-gray-500">
        {activePresetId ? "Activo" : ""}
      </span>
    </button>
  )

  if (isMobile) {
    return (
      <DrawerNested open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
        <DrawerContent className="px-4 pb-8">
          <DrawerHeader>
            <DrawerTitle>Temas predefinidos</DrawerTitle>
          </DrawerHeader>
          <div className="relative min-h-[600px]">
            <div
              className="no-scrollbar absolute inset-0 overflow-y-scroll
                overscroll-contain"
              data-vaul-no-drag
            >
              {grid}
            </div>
          </div>
        </DrawerContent>
      </DrawerNested>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-h-[90vh] sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Temas predefinidos</DialogTitle>
        </DialogHeader>
        <div className="relative min-h-[600px]">
          <div
            className="no-scrollbar absolute inset-0 overflow-y-scroll
              overscroll-contain"
          >
            {grid}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
