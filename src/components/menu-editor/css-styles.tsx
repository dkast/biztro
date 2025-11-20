"use client"

import React, { useLayoutEffect } from "react"

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
  useLayoutEffect(() => {
    if (!frameDocument || typeof document === "undefined") return

    frameDocument.head
      .querySelectorAll(`[${COPIED_ATTR}]`)
      .forEach(node => node.remove())

    document.head.querySelectorAll("style").forEach(style => {
      if (style.id === "colors") return
      cloneAndMark(style, frameDocument)
    })

    document.head.querySelectorAll('link[as="style"]').forEach(link => {
      if (link.id === "colors") return
      cloneAndMark(link, frameDocument)
    })
    document.head.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      if (link.id === "colors") return
      cloneAndMark(link, frameDocument)
    })
  }, [frameDocument])

  return <>{children}</>
}
