"use client"

import React, { useLayoutEffect } from "react"
import { useAtom } from "jotai"

import { fontThemeAtom } from "@/lib/atoms"

const COPIED_ATTR = "data-biztro-cloned"

function cloneAndMark(node: Element, target: Document) {
  const clone = node.cloneNode(true) as HTMLElement
  clone.setAttribute(COPIED_ATTR, "true")
  target.head.append(clone)
}

export default function CssStyles({
  children,
  frameDocument
}: {
  children: React.ReactNode
  frameDocument?: Document | null
}) {
  const [fontThemeId] = useAtom(fontThemeAtom)

  useLayoutEffect(() => {
    if (!frameDocument || typeof document === "undefined") return

    const cloneStylesheets = () => {
      frameDocument.head
        .querySelectorAll(`[${COPIED_ATTR}]`)
        .forEach(node => node.remove())

      document.head.querySelectorAll("style").forEach(style => {
        if (style.id === "colors") return
        cloneAndMark(style, frameDocument)
      })

      document.head
        .querySelectorAll('link[as="style"], link[rel="stylesheet"]')
        .forEach(link => {
          if (link.id === "colors") return
          cloneAndMark(link, frameDocument)
        })
    }

    const syncFontClasses = () => {
      const frameRoot = frameDocument.documentElement
      if (!frameRoot) return

      const hostClasses = Array.from(document.documentElement.classList).filter(
        cls => cls.startsWith("wf-")
      )

      const currentFontClasses = Array.from(frameRoot.classList).filter(cls =>
        cls.startsWith("wf-")
      )

      currentFontClasses.forEach(cls => frameRoot.classList.remove(cls))
      hostClasses.forEach(cls => frameRoot.classList.add(cls))
    }

    cloneStylesheets()
    syncFontClasses()
  }, [frameDocument, fontThemeId])

  return <>{children}</>
}
