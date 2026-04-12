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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  colorThemes as builtInColorThemes,
  fontThemes,
  imagePresets,
  themePresets,
  type ColorTheme,
  type ThemePreset
} from "@/lib/types/theme"
import { cn, isColorDark } from "@/lib/utils"

// ─── Solid preset card ────────────────────────────────────────────────────────

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
      type="button"
      onClick={onClick}
      className={cn(
        `group focus-visible:ring-ring focus-visible:ring-offset-background
        relative w-full overflow-hidden rounded-lg border-2 text-left
        transition-colors focus-visible:ring-2 focus-visible:ring-offset-2
        focus-visible:outline-none`,
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
        <FontWrapper fontFamily={font.fontDisplay}>
          <span
            className="block truncate text-sm leading-tight font-semibold"
            style={{ color: color.brandColor }}
          >
            {preset.name}
          </span>
        </FontWrapper>
        <div
          className="h-px w-6"
          style={{ backgroundColor: color.accentColor }}
        />
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

// ─── Image preset card ────────────────────────────────────────────────────────

function ImagePresetCard({
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

  if (!font || !color || !preset.bgImage) return null

  const bgUrl = `/bg/${preset.bgImage}`
  // Determine overlay + text strategy from the color theme tone.
  // Dark themes (dark surface) → light overlay tint; light themes → lighter overlay.
  const isDarkTheme = isColorDark(color.surfaceColor)
  const overlayClass = isDarkTheme
    ? "bg-gradient-to-b from-black/40 via-black/20 to-black/60"
    : "bg-gradient-to-b from-white/10 via-transparent to-black/50"

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        `group focus-visible:ring-ring focus-visible:ring-offset-background
        relative w-full overflow-hidden rounded-lg border-2 text-left
        transition-colors focus-visible:ring-2 focus-visible:ring-offset-2
        focus-visible:outline-none`,
        isActive
          ? "border-indigo-500"
          : `border-gray-200 hover:border-gray-400 dark:border-gray-800
            dark:hover:border-gray-600`
      )}
    >
      {/* Background image */}
      <div
        className="relative flex aspect-[4/3] flex-col justify-between bg-cover
          bg-center"
        style={{ backgroundImage: `url(${bgUrl})` }}
      >
        {/* Overlay */}
        <div className={cn("absolute inset-0", overlayClass)} />

        {/* Top: menu name + accent bar */}
        <div className="relative z-10 flex flex-col gap-1 px-3 pt-2.5">
          <FontWrapper fontFamily={font.fontDisplay}>
            <span
              className="block truncate text-sm leading-tight font-semibold
                drop-shadow-sm"
              style={{ color: color.brandColor }}
            >
              {preset.name}
            </span>
          </FontWrapper>
          <div
            className="h-px w-6 opacity-80"
            style={{ backgroundColor: color.accentColor }}
          />
        </div>

        {/* Bottom: two item rows */}
        <div className="relative z-10 flex flex-col gap-1 px-3 pb-2.5">
          <div className="flex items-baseline justify-between">
            <FontWrapper fontFamily={font.fontDisplay}>
              <span
                className="truncate text-xs leading-tight font-medium
                  drop-shadow-sm"
                style={{ color: color.textColor }}
              >
                Platillo especial
              </span>
            </FontWrapper>
            <FontWrapper fontFamily={font.fontText}>
              <span
                className="text-xs leading-tight tabular-nums drop-shadow-sm"
                style={{ color: color.textColor }}
              >
                $180
              </span>
            </FontWrapper>
          </div>
          <div className="flex items-baseline justify-between">
            <FontWrapper fontFamily={font.fontDisplay}>
              <span
                className="truncate text-xs leading-tight font-medium
                  drop-shadow-sm"
                style={{ color: color.textColor }}
              >
                Entrada
              </span>
            </FontWrapper>
            <FontWrapper fontFamily={font.fontText}>
              <span
                className="text-xs leading-tight tabular-nums drop-shadow-sm"
                style={{ color: color.textColor }}
              >
                $95
              </span>
            </FontWrapper>
          </div>
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

// ─── PresetSelector ───────────────────────────────────────────────────────────

export default function PresetSelector({
  colorThemes,
  currentFontTheme,
  currentColorTheme,
  currentBgImage,
  onSelect
}: {
  colorThemes: ColorTheme[]
  currentFontTheme: string
  currentColorTheme: string
  currentBgImage?: string
  onSelect: (fontTheme: string, colorTheme: string, bgImage?: string) => void
}) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

  const activeSolidId = useMemo(
    () =>
      themePresets.find(
        p =>
          p.fontTheme === currentFontTheme && p.colorTheme === currentColorTheme
      )?.id ?? null,
    [currentFontTheme, currentColorTheme]
  )

  const activeImageId = useMemo(
    () =>
      imagePresets.find(
        p =>
          p.fontTheme === currentFontTheme &&
          p.colorTheme === currentColorTheme &&
          p.bgImage === currentBgImage
      )?.id ?? null,
    [currentFontTheme, currentColorTheme, currentBgImage]
  )

  const activePresetName = useMemo(() => {
    if (activeSolidId)
      return themePresets.find(p => p.id === activeSolidId)?.name
    if (activeImageId)
      return imagePresets.find(p => p.id === activeImageId)?.name
    return null
  }, [activeSolidId, activeImageId])

  const handleSelect = (preset: ThemePreset) => {
    onSelect(preset.fontTheme, preset.colorTheme, preset.bgImage)
    setOpen(false)
  }

  const content = (
    <Tabs defaultValue="solid" className="flex flex-col gap-3">
      <TabsList className="w-full">
        <TabsTrigger value="solid" className="flex-1">
          Sólido
        </TabsTrigger>
        <TabsTrigger value="image" className="flex-1">
          Con imagen
        </TabsTrigger>
      </TabsList>

      <TabsContent value="solid">
        <div className="grid grid-cols-2 gap-2">
          {themePresets.map(preset => (
            <PresetCard
              key={preset.id}
              preset={preset}
              isActive={preset.id === activeSolidId}
              onClick={() => handleSelect(preset)}
              colorThemes={colorThemes}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="image">
        <div className="grid grid-cols-2 gap-2">
          {imagePresets.map(preset => (
            <ImagePresetCard
              key={preset.id}
              preset={preset}
              isActive={preset.id === activeImageId}
              onClick={() => handleSelect(preset)}
              colorThemes={colorThemes}
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )

  const triggerButton = (
    <button
      type="button"
      className="focus-visible:ring-ring focus-visible:ring-offset-background
        flex w-full flex-row items-center justify-between rounded-lg border
        border-gray-200 px-4 py-2 text-left shadow-xs transition-colors
        hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-2
        focus-visible:outline-none dark:border-gray-800 dark:bg-gray-950
        dark:hover:bg-gray-800"
    >
      <span className="text-sm">{activePresetName ?? "Elegir tema"}</span>
      <span className="text-xs text-gray-500">
        {activePresetName ? "Activo" : ""}
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
          <ScrollArea
            className={cn(
              "h-150",
              "**:data-[slot=radix-scroll-area-viewport]:scroll-fade-effect-y"
              // "**:data-[slot=scroll-area-viewport]:[--mask-offset-top:8px]",
              // "**:data-[slot=scroll-area-viewport]:[--mask-offset-bottom:8px]"
            )}
          >
            {content}
          </ScrollArea>
        </DrawerContent>
      </DrawerNested>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-h-[90vh] sm:max-w-[660px]">
        <DialogHeader>
          <DialogTitle>Temas predefinidos</DialogTitle>
        </DialogHeader>
        <ScrollArea
          className={cn(
            "h-150",
            "**:data-[slot=radix-scroll-area-viewport]:scroll-fade-effect-y"
            // "**:data-[slot=scroll-area-viewport]:[--mask-offset-top:8px]",
            // "**:data-[slot=scroll-area-viewport]:[--mask-offset-bottom:8px]"
          )}
        >
          {content}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
