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

    // // Usage
    // const isLoaded = isFontLoaded(fontFamily)

    // if (isLoaded) {
    //   console.log(
    //     `Font ${fontFamily} is ${isLoaded ? "loaded" : "not loaded"}.`
    //   )
    //   return
    // }

    WebFont.load({
      google: {
        families: [fontFamily]
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
const isFontLoaded = (fontFamily: string): boolean => {
  return document.fonts.check(`1em ${fontFamily}`)
}
