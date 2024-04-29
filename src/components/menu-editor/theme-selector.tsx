"use client"

import { use, useEffect, useState } from "react"

import FontWrapper from "@/components/menu-editor/font-wrapper"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Define an array of themes with two font names and two color names, background and foreground
const themes = [
  {
    name: "Default",
    fontDisplay: "Inter",
    fontText: "Inter",
    accentColor: "#000000",
    color: "#999999",
    backgroundColor: "#ffffff"
  },
  {
    name: "Ukraine",
    fontDisplay: "DM Serif Display",
    fontText: "DM Sans",
    accentColor: "#0033ff",
    color: "#0033ff",
    backgroundColor: "#ffcc00"
  }
]

export default function ThemeSelector() {
  const [theme, setTheme] = useState("Default")

  useEffect(() => {
    // When the theme changes, set the CSS variables to the new theme
    const selectedTheme = themes.find(t => t.name === theme)
    if (!selectedTheme) return
    console.log("selectedTheme", selectedTheme)
  }, [theme])

  return (
    <div className="flex flex-col px-2">
      {/* <h2 className="py-3 text-sm font-medium">Temas</h2> */}
      <div className="flex flex-col items-center gap-2">
        <RadioGroup
          defaultValue={theme}
          onValueChange={setTheme}
          className="w-full"
        >
          {themes.map(theme => (
            <label
              key={theme.name}
              className="[&:has([data-state=checked])>div]:border-violet-500"
            >
              <RadioGroupItem value={theme.name} className="sr-only" />
              <div
                className="w-full rounded-lg border-2 border-black/10 px-4 py-2"
                style={{
                  color: theme.color,
                  backgroundColor: theme.backgroundColor
                }}
              >
                <FontWrapper fontFamily={theme.fontDisplay}>
                  <span
                    className="text-base"
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
  )
}
