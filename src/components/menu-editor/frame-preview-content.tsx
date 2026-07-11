"use client"

import { useEffect, type RefObject } from "react"
import { Element, Frame } from "@craftjs/core"

import ContainerBlock from "@/components/menu-editor/blocks/container-block"
import HeaderBlock from "@/components/menu-editor/blocks/header-block"
import CssStyles from "@/components/menu-editor/css-styles"
import type { getDefaultLocation } from "@/server/actions/location/queries"
import type { getCurrentOrganization } from "@/server/actions/user/queries"

export interface FramePreviewContentProps {
  frameDocument: Document | null | undefined
  frameDocRef: RefObject<Document | null>
  json?: string
  organization: NonNullable<Awaited<ReturnType<typeof getCurrentOrganization>>>
  location: Awaited<ReturnType<typeof getDefaultLocation>> | null
  updateFrameHeight: () => void
}

export function pauseFrameMedia(doc: Document | null | undefined) {
  if (!doc) return

  try {
    ;(
      doc.querySelectorAll("video, audio") as NodeListOf<HTMLMediaElement>
    ).forEach(el => {
      try {
        el.pause()
      } catch {
        // ignore
      }
    })
    ;(doc.querySelectorAll("iframe") as NodeListOf<HTMLIFrameElement>).forEach(
      iframe => {
        try {
          const win = iframe.contentWindow
          win?.postMessage({ type: "react-activity-hidden" }, "*")
        } catch {
          // ignore
        }
      }
    )
  } catch {
    // ignore
  }
}

export function FramePreviewContent({
  frameDocument,
  frameDocRef,
  json,
  organization,
  location,
  updateFrameHeight
}: FramePreviewContentProps) {
  // Disable sticky header in the editor preview so it scrolls with content
  // instead of pinning to the top of the iframe's own viewport.
  useEffect(() => {
    if (!frameDocument) return
    const existing = frameDocument.getElementById("editor-canvas-overrides")
    existing?.remove()
    const style = frameDocument.createElement("style")
    style.id = "editor-canvas-overrides"
    style.textContent =
      "header, nav { position: relative !important; top: unset !important; }"
    frameDocument.head.appendChild(style)
    return () => {
      frameDocument.getElementById("editor-canvas-overrides")?.remove()
    }
  }, [frameDocument])

  useEffect(() => {
    frameDocRef.current = frameDocument ?? null
    if (!frameDocument) return

    updateFrameHeight()
    const win = frameDocument.defaultView
    const target = frameDocument.body ?? frameDocument.documentElement
    if (!target) return

    const ResizeObserverClass = win?.ResizeObserver ?? window.ResizeObserver
    if (!ResizeObserverClass) return

    const resizeObserver = new ResizeObserverClass(() => {
      updateFrameHeight()
    })
    resizeObserver.observe(target)
    return () => {
      resizeObserver.disconnect()
      pauseFrameMedia(frameDocument)
    }
  }, [frameDocument, frameDocRef, updateFrameHeight])

  return (
    <CssStyles frameDocument={frameDocument}>
      <Frame data={json}>
        <Element is={ContainerBlock} canvas>
          <HeaderBlock
            organization={organization}
            location={location ?? undefined}
            showBanner={Boolean(organization.banner?.trim())}
          />
        </Element>
      </Frame>
    </CssStyles>
  )
}
