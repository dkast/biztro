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

// Heading shape CSS utilities - injected directly into iframe
// since Tailwind @utility classes may not be available in the iframe context
const HEADING_SHAPE_STYLES = `
/* Category Heading Shape Utilities */
.heading-shape {
  position: relative;
  isolation: isolate;
  padding: 0.5rem 0.5rem;
}
.heading-shape::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background-color: var(--heading-bg-color, transparent);
}

/* Rectangle (default) */
.heading-shape-rectangle::before {}

/* Rounded */
.heading-shape-rounded::before {
  border-radius: 0.5rem;
}

/* Pill */
.heading-shape-pill::before {
  border-radius: 9999px;
}

/* Slanted Edge - diagonal cut on right side */
.heading-shape-slanted::before {
  --slant: 20px;
  clip-path: polygon(0 0, 100% 0, calc(100% - var(--slant)) 100%, 0 100%);
}

/* Parallelogram */
.heading-shape-parallelogram {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}
.heading-shape-parallelogram::before {
  --slant: 20px;
  clip-path: polygon(var(--slant) 0, 100% 0, calc(100% - var(--slant)) 100%, 0 100%);
}

/* Chevron */
.heading-shape-chevron {
  padding-left: 1.25rem;
  padding-right: 1.25rem;
}
.heading-shape-chevron::before {
  --point: 15px;
  clip-path: polygon(0 0, calc(100% - var(--point)) 0, 100% 50%, calc(100% - var(--point)) 100%, 0 100%, var(--point) 50%);
}

/* Rounded Tab */
.heading-shape-tab::before {
  --r: 12px;
  border-radius: calc(2 * var(--r)) calc(2 * var(--r)) 0 0;
  -webkit-mask:
    radial-gradient(var(--r) at var(--r) 0, #0000 98%, #000 101%)
      calc(-1 * var(--r)) 100% / 100% var(--r) repeat-x,
    conic-gradient(#000 0 0) padding-box;
  mask:
    radial-gradient(var(--r) at var(--r) 0, #0000 98%, #000 101%)
      calc(-1 * var(--r)) 100% / 100% var(--r) repeat-x,
    conic-gradient(#000 0 0) padding-box;
}

/* Scooped Corners */
.heading-shape-scooped::before {
  --r: 12px;
  -webkit-mask:
    radial-gradient(var(--r) at 0 0, #0000 98%, #000) 0 0,
    radial-gradient(var(--r) at 100% 0, #0000 98%, #000) 100% 0,
    radial-gradient(var(--r) at 0 100%, #0000 98%, #000) 0 100%,
    radial-gradient(var(--r) at 100% 100%, #0000 98%, #000) 100% 100%;
  mask:
    radial-gradient(var(--r) at 0 0, #0000 98%, #000) 0 0,
    radial-gradient(var(--r) at 100% 0, #0000 98%, #000) 100% 0,
    radial-gradient(var(--r) at 0 100%, #0000 98%, #000) 0 100%,
    radial-gradient(var(--r) at 100% 100%, #0000 98%, #000) 100% 100%;
  -webkit-mask-size: 51% 51%;
  mask-size: 51% 51%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

/* Ribbon */
.heading-shape-ribbon {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}
.heading-shape-ribbon::before {
  --s: 0.6em;
  --d: 0.35em;
  --c: 0.35em;
  inset: 0;
  background:
    conic-gradient(at left var(--s) bottom var(--d),
      #0000 25%, #0008 0 37.5%, #0004 0) 0 / 50% 100% no-repeat,
    conic-gradient(at right var(--s) bottom var(--d),
      #0004 62.5%, #0008 0 75%, #0000 0) 100% / 50% 100% no-repeat,
    var(--heading-bg-color, transparent);
  clip-path: polygon(
    0 var(--d),
    var(--s) var(--d),
    var(--s) 0,
    calc(100% - var(--s)) 0,
    calc(100% - var(--s)) var(--d),
    100% var(--d),
    calc(100% - var(--c)) calc(50% + var(--d) / 2),
    100% 100%,
    calc(100% - var(--s) - var(--d)) 100%,
    calc(100% - var(--s) - var(--d)) calc(100% - var(--d)),
    calc(var(--s) + var(--d)) calc(100% - var(--d)),
    calc(var(--s) + var(--d)) 100%,
    0 100%,
    var(--c) calc(50% + var(--d) / 2)
  );
}
`

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

      // Inject heading shape styles directly into iframe
      const headingShapeStyle = frameDocument.createElement("style")
      headingShapeStyle.setAttribute(COPIED_ATTR, "true")
      headingShapeStyle.setAttribute("id", "heading-shapes")
      headingShapeStyle.textContent = HEADING_SHAPE_STYLES
      frameDocument.head.append(headingShapeStyle)
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
