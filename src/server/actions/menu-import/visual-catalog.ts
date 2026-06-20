import {
  colorThemes,
  fontThemes,
  imagePresets,
  themePresets
} from "@/lib/types/theme"

const menuImportVisualCatalog = {
  fontThemes: fontThemes.map(theme => ({
    name: theme.name,
    fontDisplay: theme.fontDisplay,
    fontText: theme.fontText,
    tags: theme.tags ?? []
  })),
  colorThemes: colorThemes.map(theme => ({
    id: theme.id,
    name: theme.name,
    tags: theme.tags ?? [],
    palette: {
      surfaceColor: theme.surfaceColor,
      brandColor: theme.brandColor,
      accentColor: theme.accentColor,
      textColor: theme.textColor,
      mutedColor: theme.mutedColor
    }
  })),
  themePresets: themePresets.map(preset => ({
    id: preset.id,
    name: preset.name,
    description: preset.description,
    fontTheme: preset.fontTheme,
    colorTheme: preset.colorTheme,
    tags: preset.tags
  })),
  imagePresets: imagePresets.map(preset => ({
    id: preset.id,
    name: preset.name,
    description: preset.description,
    fontTheme: preset.fontTheme,
    colorTheme: preset.colorTheme,
    bgImage: preset.bgImage,
    tags: preset.tags
  }))
}

const menuImportVisualCatalogPrompt = JSON.stringify(menuImportVisualCatalog)

export function getMenuImportVisualCatalogPrompt() {
  return menuImportVisualCatalogPrompt
}
