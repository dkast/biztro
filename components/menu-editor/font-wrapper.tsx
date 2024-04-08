"use client"

import React, { useEffect } from "react"
import WebFont from "webfontloader"

export default function FontWrapper({
  fontFamily,
  children
}: {
  fontFamily: string | undefined
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!fontFamily) return

    const isLoaded = hasFontLoaded(fontFamily)
    if (isLoaded) {
      console.log(
        `Font ${fontFamily} is ${isLoaded ? "loaded" : "not loaded"}.`
      )
      return
    }

    WebFont.load({
      google: {
        families: [`${fontFamily}:200,400,500,600`]
      },
      fontactive: function (familyName, fvd) {
        console.log(familyName + " has loaded.")
      },
      fontinactive: function (familyName, fvd) {
        console.log(familyName + " failed to load.")
      }
    })
  }, [fontFamily])

  return (
    <div
      style={{
        fontFamily: `'${fontFamily}'`
      }}
    >
      {children}
    </div>
  )
}

export function hasFontLoaded(fontFamily: string): boolean {
  const className = `wf-${fontFamily.toLowerCase().replace(/ /g, "")}-n4-active`
  console.log("Checking for class", className)
  return document.documentElement.classList.contains(className)
}
