"use client"

import React, { useEffect } from "react"

import { cn } from "@/lib/utils"

const PRELOADED_FONT_FAMILIES = new Set(["Inter", "Sora"])
const loadedFontFamilies = new Set<string>()
const loadingFontFamilies = new Map<string, Promise<void>>()

function markFontAsReady(fontFamily: string) {
  loadedFontFamilies.add(fontFamily)
  loadingFontFamilies.delete(fontFamily)
}

// Cache font requests so multiple previews mounting at once only trigger one WebFontLoader call.
function ensureFontLoaded(fontFamily: string) {
  if (PRELOADED_FONT_FAMILIES.has(fontFamily)) {
    loadedFontFamilies.add(fontFamily)
    return Promise.resolve()
  }

  if (typeof document !== "undefined" && hasFontLoaded(fontFamily)) {
    loadedFontFamilies.add(fontFamily)
    return Promise.resolve()
  }

  if (loadedFontFamilies.has(fontFamily)) {
    return Promise.resolve()
  }

  const pending = loadingFontFamilies.get(fontFamily)
  if (pending) {
    return pending
  }

  const promise = import("webfontloader")
    .then(WebFont => {
      return new Promise<void>(resolve => {
        WebFont.default.load({
          google: {
            families: [`${fontFamily}:300,400,500,700`]
          },
          active: () => {
            markFontAsReady(fontFamily)
            resolve()
          },
          inactive: () => {
            loadingFontFamilies.delete(fontFamily)
            resolve()
          }
        })
      })
    })
    .catch(err => {
      loadingFontFamilies.delete(fontFamily)
      console.error("Error loading WebFont:", err)
      Sentry.captureException(err, {
        tags: { section: "font-wrapper" },
        extra: { fontFamily }
      })
    })

  loadingFontFamilies.set(fontFamily, promise)
  return promise
}

export default function FontWrapper({
  fontFamily,
  children,
  className
}: {
  fontFamily: string | undefined
  children: React.ReactNode
  className?: string
}) {
  useEffect(() => {
    if (!fontFamily) return

    void ensureFontLoaded(fontFamily)
  }, [fontFamily])

  return (
    <div
      className={cn(className, "contents")}
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
  return document.documentElement.classList.contains(className)
}
