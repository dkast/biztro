"use client"

import { useEffect, useState } from "react"
import { useEditor } from "@craftjs/core"
import { hexToRgba } from "@uiw/react-color"
import { useAtom } from "jotai"

import FontWrapper from "@/components/menu-editor/font-wrapper"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { themeAtom } from "@/lib/atoms"
import { themes } from "@/lib/types"

export default function ThemeSelector() {
  const [theme, setTheme] = useAtom(themeAtom)
  const { nodes, actions } = useEditor(state => ({
    nodes: state.nodes
  }))

  useEffect(() => {
    // When the theme changes, set the CSS variables to the new theme
    const selectedTheme = themes.find(t => t.name === theme)
    if (!selectedTheme) return

    console.log("selectedTheme", selectedTheme)
    console.dir(nodes)

    // traverse each node and update the theme
    if (!nodes) return

    for (const [key, value] of Object.entries(nodes)) {
      if (value.data?.props) {
        const props = value.data.props

        // update the theme for the node
        // props.theme = selectedTheme
        console.log("props", props)
        switch (value.data.name) {
          case "ContainerBlock":
            actions.setProp(key, props => {
              return (props = Object.assign(props, {
                color: hexToRgba(selectedTheme.color),
                backgroundColor: hexToRgba(selectedTheme.backgroundColor)
              }))
            })
            break
          case "HeaderBlock":
            actions.setProp(key, props => {
              return (props = Object.assign(props, {
                fontFamily: selectedTheme.fontDisplay,
                accentColor: hexToRgba(selectedTheme.accentColor)
              }))
            })
            break
          case "CategoryBlock":
            actions.setProp(key, props => {
              return (props = Object.assign(props, {
                categoryColor: hexToRgba(selectedTheme.accentColor),
                categoryFontFamily: selectedTheme.fontDisplay,
                itemColor: hexToRgba(selectedTheme.accentColor),
                itemFontFamily: selectedTheme.fontDisplay,
                priceColor: hexToRgba(selectedTheme.accentColor),
                priceFontFamily: selectedTheme.fontText,
                descriptionFontFamily: selectedTheme.fontText
              }))
            })
            break
          case "TextElement":
            actions.setProp(key, props => {
              return (props = Object.assign(props, {
                color: hexToRgba(selectedTheme.color),
                fontFamily: selectedTheme.fontText
              }))
            })
            break
          default:
            break
        }
      }
    }
  }, [theme])

  return (
    <div className="relative h-full">
      <div className="no-scrollbar absolute inset-0 overflow-y-scroll p-2">
        <div className="flex flex-col items-center gap-2">
          <RadioGroup value={theme} onValueChange={setTheme} className="w-full">
            {themes.map(theme => (
              <label
                key={theme.name}
                className="cursor-pointer [&:has([data-state=checked])>div]:border-violet-500"
              >
                <RadioGroupItem value={theme.name} className="sr-only" />
                <div
                  className="w-full rounded-lg border-2 border-black/10 px-4 py-2 hover:border-black/20"
                  style={{
                    color: theme.color,
                    backgroundColor: theme.backgroundColor
                  }}
                >
                  <FontWrapper fontFamily={theme.fontDisplay}>
                    <span
                      className="text-base font-medium"
                      style={{
                        color: theme.accentColor
                      }}
                    >
                      {theme.fontDisplay}
                    </span>
                  </FontWrapper>
                  <FontWrapper fontFamily={theme.fontText}>
                    <span
                      className="text-sm"
                      style={{
                        color: theme.color
                      }}
                    >
                      {theme.fontText}
                    </span>
                  </FontWrapper>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  )
}
