"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useEditor } from "@craftjs/core"
import type { Prisma } from "@prisma/client"
import { PopoverAnchor } from "@radix-ui/react-popover"
import { useQueryClient } from "@tanstack/react-query"
import { hexToRgba } from "@uiw/react-color"
import { useAtom } from "jotai"
import { ChevronsUpDown } from "lucide-react"
import lz from "lzutf8"
import { useAction } from "next-safe-action/hooks"

import { useSetUnsavedChanges } from "@/components/dashboard/unsaved-changes-provider"
import FontWrapper from "@/components/menu-editor/font-wrapper"
import SideSection from "@/components/menu-editor/side-section"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import { updateMenuSerialData } from "@/server/actions/menu/mutations"
import { type getMenuById } from "@/server/actions/menu/queries"
import { colorListAtom, colorThemeAtom, fontThemeAtom } from "@/lib/atoms"
import { fontThemes } from "@/lib/types"
import { ColorThemeEditor } from "./color-theme-editor"

export default function ThemeSelector({
  menu
}: {
  menu: Prisma.PromiseReturnType<typeof getMenuById>
}) {
  const { nodes, actions, query } = useEditor(state => ({
    nodes: state.nodes
  }))

  const queryClient = useQueryClient()

  // Atoms
  const [fontThemeId, setFontThemeId] = useAtom(fontThemeAtom)
  const [colorThemes, setColorThemes] = useAtom(colorListAtom)

  // Hooks
  const [openColorThemeEditor, setOpenColorThemeEditor] = useState(false)
  const [selectedFontTheme, setSelectedFontTheme] = useState<
    (typeof fontThemes)[0] | undefined
  >(undefined)
  const [colorThemeId, setColorThemeId] = useAtom(colorThemeAtom)
  const [selectedColorTheme, setSelectedColorTheme] = useState<
    (typeof colorThemes)[0] | undefined
  >(undefined)

  // Fonts
  useEffect(() => {
    // When the theme changes, set the CSS variables to the new theme
    const selectedTheme = fontThemes.find(theme => theme.name === fontThemeId)
    if (!selectedTheme) return

    setSelectedFontTheme(selectedTheme)

    // traverse each node and update the theme
    if (!nodes) return

    for (const [key, value] of Object.entries(nodes)) {
      if (value.data?.props) {
        const { setProp: setIgnoreProp } = actions.history.ignore()
        switch (value.data.name) {
          case "HeaderBlock":
            setIgnoreProp(key, props => {
              return (props = Object.assign(props, {
                fontFamily: selectedTheme.fontDisplay
              }))
            })
            break
          case "CategoryBlock":
            setIgnoreProp(key, props => {
              return (props = Object.assign(props, {
                categoryFontFamily: selectedTheme.fontDisplay,
                itemFontFamily: selectedTheme.fontDisplay,
                priceFontFamily: selectedTheme.fontText,
                descriptionFontFamily: selectedTheme.fontText
              }))
            })
            break
          case "ItemBlock":
            setIgnoreProp(key, props => {
              return (props = Object.assign(props, {
                itemFontFamily: selectedTheme.fontDisplay,
                priceFontFamily: selectedTheme.fontText,
                descriptionFontFamily: selectedTheme.fontText
              }))
            })
            break
          case "TextElement":
            setIgnoreProp(key, props => {
              return (props = Object.assign(props, {
                fontFamily: selectedTheme.fontText
              }))
            })
            break
          case "HeadingElement":
            setIgnoreProp(key, props => {
              return (props = Object.assign(props, {
                fontFamily: selectedTheme.fontDisplay
              }))
            })
            break
          default:
            break
        }
      }
    }
  }, [fontThemeId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    updateColorTheme(colorThemeId)
  }, [colorThemeId, colorThemes]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateColorTheme = (colorThemeId: string) => {
    const selectedTheme = colorThemes.find(theme => theme.id === colorThemeId)
    if (!selectedTheme) {
      console.error("Theme not found")
      return
    }

    setSelectedColorTheme(selectedTheme)

    // traverse each node and update the theme
    if (!nodes) return

    for (const [key, value] of Object.entries(nodes)) {
      if (value.data?.props) {
        const { setProp: setIgnoreProp } = actions.history.ignore()
        switch (value.data.name) {
          case "ContainerBlock":
            setIgnoreProp(key, props => {
              return (props = Object.assign(props, {
                color: hexToRgba(selectedTheme.textColor),
                backgroundColor: hexToRgba(selectedTheme.surfaceColor)
              }))
            })
            break
          case "HeaderBlock":
            setIgnoreProp(key, props => {
              return (props = Object.assign(props, {
                color: hexToRgba(selectedTheme.textColor),
                accentColor: hexToRgba(selectedTheme.brandColor),
                backgroundColor: hexToRgba(selectedTheme.surfaceColor)
              }))
            })
            break
          case "CategoryBlock":
            setIgnoreProp(key, props => {
              return (props = Object.assign(props, {
                categoryColor: hexToRgba(selectedTheme.accentColor),
                itemColor: hexToRgba(selectedTheme.textColor),
                priceColor: hexToRgba(selectedTheme.accentColor),
                descriptionColor: hexToRgba(selectedTheme.mutedColor)
              }))
            })
            break
          case "ItemBlock":
            setIgnoreProp(key, props => {
              return (props = Object.assign(props, {
                itemColor: hexToRgba(selectedTheme.textColor),
                priceColor: hexToRgba(selectedTheme.accentColor),
                descriptionColor: hexToRgba(selectedTheme.mutedColor)
              }))
            })
            break
          case "TextElement":
            setIgnoreProp(key, props => {
              return (props = Object.assign(props, {
                color: hexToRgba(selectedTheme.textColor)
              }))
            })
            break
          case "HeadingElement":
            setIgnoreProp(key, props => {
              return (props = Object.assign(props, {
                color: hexToRgba(selectedTheme.accentColor)
              }))
            })
            break
          case "NavigatorBlock":
            setIgnoreProp(key, props => {
              return (props = Object.assign(props, {
                color: hexToRgba(selectedTheme.brandColor)
              }))
            })
            break
          default:
            break
        }
      }
    }
  }

  // Update the menu theme
  const {
    execute: updateSerialData,
    // status: statusSerialData,
    reset: resetSerialData
  } = useAction(updateMenuSerialData, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Menú actualizado")
        queryClient.invalidateQueries({
          queryKey: ["menu", menu?.id]
        })
        // Reset history to avoid undoing the update
        actions.history.clear()
      } else if (data?.failure.reason) {
        toast.error(data.failure.reason)
      }
      resetSerialData()
    },
    onError: () => {
      toast.error("Ocurrió un error")
      resetSerialData()
    }
  })

  // Verify if the menu theme has changed
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges()

  useEffect(() => {
    if (menu) {
      if (
        menu?.fontTheme !== fontThemeId ||
        menu?.colorTheme !== colorThemeId
      ) {
        setUnsavedChanges({
          message:
            "Tienes cambios sin guardar ¿Estás seguro de salir del Editor?",
          dismissButtonLabel: "Cancelar",
          proceedLinkLabel: "Descartar cambios",
          proceedAction: () => {
            setFontThemeId(menu.fontTheme)
            setColorThemeId(menu.colorTheme)
          }
        })
      } else {
        clearUnsavedChanges()
      }
    }
  }, [
    menu,
    fontThemeId,
    colorThemeId,
    setUnsavedChanges,
    setFontThemeId,
    setColorThemeId,
    clearUnsavedChanges
  ])

  if (!menu) return null

  const onUpdateSerialData = (colorThemeId: string) => {
    updateColorTheme(colorThemeId)
    const json = query.serialize()
    const serialData = lz.encodeBase64(lz.compress(json))
    updateSerialData({
      id: menu?.id,
      fontTheme: fontThemeId,
      colorTheme: colorThemeId,
      serialData
    })
  }

  return (
    <div className="editor-theme flex flex-col">
      <SideSection title="Tipografía">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex w-full flex-row items-center justify-between rounded-lg border-[0.5px] border-gray-300 px-4 py-2 text-left shadow-sm transition-colors hover:border-lime-400 hover:ring-2 hover:ring-lime-100 dark:border-gray-700 dark:hover:border-green-600 dark:hover:ring-green-900">
              <div>
                <FontWrapper fontFamily={selectedFontTheme?.fontDisplay}>
                  <span className="text-base font-medium">
                    {selectedFontTheme?.fontDisplay}
                  </span>
                </FontWrapper>
                <FontWrapper fontFamily={selectedFontTheme?.fontText}>
                  <span className="text-sm">{selectedFontTheme?.fontText}</span>
                </FontWrapper>
              </div>
              <ChevronsUpDown className="size-4 text-gray-500" />
            </button>
          </PopoverTrigger>
          <PopoverAnchor asChild>
            <div className="-ml-40 size-0" />
          </PopoverAnchor>
          <PopoverContent className="-mt-20 max-w-[250px]">
            <Label className="mb-4 block">Tipografías</Label>
            <div className="relative min-h-[400px]">
              <div className="no-scrollbar absolute inset-0 overflow-y-scroll overscroll-contain">
                <div className="flex flex-col items-center gap-2">
                  <RadioGroup
                    value={fontThemeId}
                    onValueChange={setFontThemeId}
                    className="w-full"
                  >
                    {fontThemes.map(theme => (
                      <label
                        key={theme.name}
                        className="cursor-pointer [&:has([data-state=checked])>div]:border-lime-400 [&:has([data-state=checked])>div]:bg-lime-50 dark:[&:has([data-state=checked])>div]:border-green-700 dark:[&:has([data-state=checked])>div]:bg-green-900/30"
                      >
                        <RadioGroupItem
                          value={theme.name}
                          className="sr-only"
                        />
                        <div className="w-full rounded-lg border border-gray-300 px-4 py-2 hover:border-gray-500 dark:border-gray-800 dark:hover:border-gray-400">
                          <FontWrapper fontFamily={theme.fontDisplay}>
                            <span className="text-base font-medium">
                              {theme.fontDisplay}
                            </span>
                          </FontWrapper>
                          <FontWrapper fontFamily={theme.fontText}>
                            <span className="text-sm">{theme.fontText}</span>
                          </FontWrapper>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </SideSection>
      <SideSection title="Colores">
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex w-full flex-row items-center justify-between rounded-lg border-[0.5px] border-gray-300 px-4 py-2 text-left shadow-sm transition-colors hover:border-lime-400 hover:ring-2 hover:ring-lime-100 dark:border-gray-700 dark:hover:border-green-600 dark:hover:ring-green-900">
                <div className="">
                  <div className="flex flex-row items-center gap-2">
                    <div className="isolate flex overflow-hidden">
                      <ColorChip color={selectedColorTheme?.surfaceColor} />
                      <ColorChip color={selectedColorTheme?.brandColor} />
                      <ColorChip color={selectedColorTheme?.accentColor} />
                      <ColorChip color={selectedColorTheme?.textColor} />
                      <ColorChip color={selectedColorTheme?.mutedColor} />
                    </div>
                  </div>
                </div>
                <ChevronsUpDown className="size-4 text-gray-500" />
              </button>
            </PopoverTrigger>
            <PopoverAnchor asChild>
              <div className="-ml-28 size-0" />
            </PopoverAnchor>
            <PopoverContent className="-mt-20 max-w-[170px]">
              <Label className="mb-4 block">Colores</Label>
              <div className="relative h-[300px]">
                <div className="no-scrollbar absolute inset-0 overflow-y-scroll overscroll-contain">
                  <div className="flex flex-col items-center gap-2">
                    <RadioGroup
                      value={colorThemeId}
                      onValueChange={setColorThemeId}
                      className="w-full"
                    >
                      {colorThemes.map(theme => (
                        <label
                          key={theme.id}
                          className="cursor-pointer [&:has([data-state=checked])>div]:border-lime-400 [&:has([data-state=checked])>div]:bg-lime-50 dark:[&:has([data-state=checked])>div]:border-green-700 dark:[&:has([data-state=checked])>div]:bg-green-900/30"
                        >
                          <RadioGroupItem
                            value={theme.id}
                            className="sr-only"
                          />
                          <div className="flex w-full flex-col justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:border-gray-500 dark:border-gray-800 dark:hover:border-gray-400">
                            <span className="text-xs font-medium">
                              {theme.name}
                            </span>
                            <div className="isolate mx-auto flex overflow-hidden">
                              <ColorChip color={theme.surfaceColor} />
                              <ColorChip color={theme.brandColor} />
                              <ColorChip color={theme.accentColor} />
                              <ColorChip color={theme.textColor} />
                              <ColorChip color={theme.mutedColor} />
                            </div>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div>
          {selectedColorTheme && (
            <Sheet
              open={openColorThemeEditor}
              onOpenChange={setOpenColorThemeEditor}
            >
              <SheetTrigger asChild>
                <Button variant="secondary" size="xs" className="w-full">
                  Personalizar tema
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Personalizar tema</SheetTitle>
                  <SheetDescription>
                    Personaliza los colores de tu menú
                  </SheetDescription>
                </SheetHeader>
                <ColorThemeEditor
                  menu={menu}
                  fontDisplay={selectedFontTheme?.fontDisplay}
                  fontText={selectedFontTheme?.fontText}
                  theme={selectedColorTheme}
                  setTheme={(theme: (typeof colorThemes)[0]) => {
                    const selectedTheme = colorThemes.find(
                      t => t.id === theme.id
                    )
                    if (!selectedTheme) {
                      // If the theme is not found, add it to the list
                      colorThemes.push(theme)
                      setColorThemeId(theme.id)
                    } else {
                      const index = colorThemes.findIndex(
                        t => t.id === theme.id
                      )
                      colorThemes[index] = theme
                      // Manually update the theme
                      setColorThemeId(colorThemeId)
                      updateColorTheme(theme.id)
                    }
                    queryClient.invalidateQueries({
                      queryKey: ["themes"]
                    })
                    setOpenColorThemeEditor(false)
                  }}
                  removeTheme={(themeId: string) => {
                    console.log("colorThemes", colorThemes)
                    const index = colorThemes.findIndex(t => t.id === themeId)
                    console.log("index", index)
                    // Remove the theme from the list
                    colorThemes.splice(index, 1)
                    console.log("themeId", themeId)
                    console.log("colorThemes", colorThemes)
                    setColorThemes([...colorThemes])

                    queryClient.invalidateQueries({
                      queryKey: ["themes"]
                    })

                    if (colorThemes[0]) {
                      setColorThemeId(colorThemes[0].id)
                      onUpdateSerialData(colorThemes[0].id)
                    }
                    setOpenColorThemeEditor(false)
                  }}
                />
              </SheetContent>
            </Sheet>
          )}
        </div>
      </SideSection>
    </div>
  )
}

function ColorChip({ color }: { color: string | undefined }) {
  return (
    <div
      className="h-6 w-4 border-y border-black/20 first:rounded-l first:border-l last:rounded-r last:border-r dark:border-white/10"
      style={{
        backgroundColor: color
      }}
    />
  )
}
