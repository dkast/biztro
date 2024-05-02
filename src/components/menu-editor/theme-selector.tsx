"use client"

import { useEffect, useState } from "react"
import { useEditor } from "@craftjs/core"
import { hexToRgba } from "@uiw/react-color"
import { useAtom } from "jotai"

import FontWrapper from "@/components/menu-editor/font-wrapper"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { colorThemeAtom, fontThemeAtom } from "@/lib/atoms"
import { colorThemes, fontThemes } from "@/lib/types"

export default function ThemeSelector() {
  const { nodes, actions } = useEditor(state => ({
    nodes: state.nodes
  }))

  const [fontThemeId, setFontThemeId] = useAtom(fontThemeAtom)

  const [selectedFontTheme, setSelectedFontTheme] = useState<
    (typeof fontThemes)[0] | undefined
  >(undefined)

  const [colorThemeId, setColorThemeId] = useAtom(colorThemeAtom)
  const [selectedColorTheme, setSelectedColorTheme] = useState<
    (typeof colorThemes)[0] | undefined
  >(undefined)

  useEffect(() => {
    // When the theme changes, set the CSS variables to the new theme
    const selectedTheme = fontThemes.find(theme => theme.name === fontThemeId)
    if (!selectedTheme) return

    console.log("selectedTheme", selectedTheme)
    setSelectedFontTheme(selectedTheme)

    // traverse each node and update the theme
    if (!nodes) return

    for (const [key, value] of Object.entries(nodes)) {
      if (value.data?.props) {
        const props = value.data.props

        // update the theme for the node
        // props.theme = selectedTheme
        console.log("props", props)
        const { setProp } = actions.history.ignore()
        switch (value.data.name) {
          // case "ContainerBlock":
          //   setProp(key, props => {
          //     return (props = Object.assign(props, {
          //       color: hexToRgba(selectedTheme.color),
          //       backgroundColor: hexToRgba(selectedTheme.backgroundColor)
          //     }))
          //   })
          //   break
          case "HeaderBlock":
            setProp(key, props => {
              return (props = Object.assign(props, {
                fontFamily: selectedTheme.fontDisplay
              }))
            })
            break
          case "CategoryBlock":
            setProp(key, props => {
              return (props = Object.assign(props, {
                categoryFontFamily: selectedTheme.fontDisplay,
                itemFontFamily: selectedTheme.fontDisplay,
                priceFontFamily: selectedTheme.fontText,
                descriptionFontFamily: selectedTheme.fontText
              }))
            })
            break
          case "TextElement":
            setProp(key, props => {
              return (props = Object.assign(props, {
                fontFamily: selectedTheme.fontText
              }))
            })
            break
          default:
            break
        }
      }
    }
  }, [fontThemeId])

  useEffect(() => {
    const selectedTheme = colorThemes.find(theme => theme.name === colorThemeId)
    if (!selectedTheme) return

    setSelectedColorTheme(selectedTheme)

    // traverse each node and update the theme
    if (!nodes) return

    for (const [key, value] of Object.entries(nodes)) {
      if (value.data?.props) {
        const props = value.data.props

        // update the theme for the node
        // props.theme = selectedTheme
        console.log("props", props)
        const { setProp } = actions.history.ignore()
        switch (value.data.name) {
          case "ContainerBlock":
            setProp(key, props => {
              return (props = Object.assign(props, {
                color: hexToRgba(selectedTheme.textColor),
                backgroundColor: hexToRgba(selectedTheme.surfaceColor)
              }))
            })
            break
          case "HeaderBlock":
            setProp(key, props => {
              return (props = Object.assign(props, {
                accentColor: hexToRgba(selectedTheme.brandColor)
              }))
            })
            break
          case "CategoryBlock":
            setProp(key, props => {
              return (props = Object.assign(props, {
                categoryColor: hexToRgba(selectedTheme.accentColor),
                itemColor: hexToRgba(selectedTheme.textColor),
                priceColor: hexToRgba(selectedTheme.brandColor),
                descriptionColor: hexToRgba(selectedTheme.mutedColor)
              }))
            })
            break
          case "TextElement":
            setProp(key, props => {
              return (props = Object.assign(props, {
                color: hexToRgba(selectedTheme.textColor)
              }))
            })
            break
          default:
            break
        }
      }
    }
  }, [colorThemeId])

  return (
    <div className="flex flex-col gap-4 p-3">
      <div>
        <Label className="mb-3 block">Tipografía</Label>
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-left shadow-sm transition-colors hover:border-gray-500">
              <FontWrapper fontFamily={selectedFontTheme?.fontDisplay}>
                <span className="text-base font-medium">
                  {selectedFontTheme?.fontDisplay}
                </span>
              </FontWrapper>
              <FontWrapper fontFamily={selectedFontTheme?.fontText}>
                <span className="text-sm">{selectedFontTheme?.fontText}</span>
              </FontWrapper>
            </button>
          </PopoverTrigger>
          <PopoverContent>
            <Label className="mb-4 block">Tipografías</Label>
            <div className="relative h-[500px]">
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
                        className="cursor-pointer [&:has([data-state=checked])>div]:border-violet-500"
                      >
                        <RadioGroupItem
                          value={theme.name}
                          className="sr-only"
                        />
                        <div className="w-full rounded-lg border border-gray-300 px-4 py-2 hover:border-gray-500">
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
      </div>
      <div>
        <Label className="mb-3 block">Colores</Label>
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full space-y-1 rounded-lg border border-gray-300 px-4 py-2 text-left shadow-sm transition-colors hover:border-gray-500">
                <span className="text-sm font-medium">
                  {selectedColorTheme?.name}
                </span>
                <div className="isolate flex -space-x-1 overflow-hidden">
                  <div
                    className="h-6 w-6 rounded-full border border-black/10"
                    style={{
                      backgroundColor: selectedColorTheme?.surfaceColor
                    }}
                  />
                  <div
                    className="h-6 w-6 rounded-full border border-black/10"
                    style={{
                      backgroundColor: selectedColorTheme?.brandColor
                    }}
                  />
                  <div
                    className="h-6 w-6 rounded-full border border-black/10"
                    style={{
                      backgroundColor: selectedColorTheme?.accentColor
                    }}
                  />
                  <div
                    className="h-6 w-6 rounded-full border border-black/10"
                    style={{
                      backgroundColor: selectedColorTheme?.textColor
                    }}
                  />
                  <div
                    className="h-6 w-6 rounded-full border border-black/10"
                    style={{
                      backgroundColor: selectedColorTheme?.mutedColor
                    }}
                  />
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent>
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
                          key={theme.name}
                          className="cursor-pointer [&:has([data-state=checked])>div]:border-violet-500"
                        >
                          <RadioGroupItem
                            value={theme.name}
                            className="sr-only"
                          />
                          <div className="w-full space-y-1 rounded-lg border border-gray-300 px-4 py-2 hover:border-gray-500">
                            <span className="text-sm font-medium">
                              {theme.name}
                            </span>
                            <div className="isolate flex -space-x-1 overflow-hidden">
                              <div
                                className="h-6 w-6 rounded-full border border-black/10"
                                style={{
                                  backgroundColor: theme?.surfaceColor
                                }}
                              />
                              <div
                                className="h-6 w-6 rounded-full border border-black/10"
                                style={{
                                  backgroundColor: theme?.brandColor
                                }}
                              />
                              <div
                                className="h-6 w-6 rounded-full border border-black/10"
                                style={{
                                  backgroundColor: theme?.accentColor
                                }}
                              />
                              <div
                                className="h-6 w-6 rounded-full border border-black/10"
                                style={{
                                  backgroundColor: theme?.textColor
                                }}
                              />
                              <div
                                className="h-6 w-6 rounded-full border border-black/10"
                                style={{
                                  backgroundColor: theme?.mutedColor
                                }}
                              />
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
      </div>
    </div>
  )
}
