"use client"

import { useEffect, useMemo, useState } from "react"
import IFrame, { FrameContextConsumer } from "react-frame-component"
import { Monitor, Smartphone } from "lucide-react"

import CssStyles from "@/components/menu-editor/css-styles"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useIsMobile } from "@/hooks/use-mobile"
import ResolveEditor from "@/app/[subdomain]/resolve-editor"
import { cn } from "@/lib/utils"

type PreviewMode = "inline" | "iframe"

export function PreviewToggle({ json }: { json?: string }) {
  const [mode, setMode] = useState<PreviewMode>("inline")
  const [mounted, setMounted] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isMobile) setMode("inline")
  }, [isMobile])

  const showToggle = mounted && !isMobile
  const effectiveMode: PreviewMode = showToggle ? mode : "inline"

  const content = useMemo(() => {
    if (!json) return null

    if (effectiveMode === "iframe") {
      return (
        <div
          className="relative flex w-full rounded-lg border bg-white shadow
            dark:border-gray-800 dark:bg-gray-950"
          style={{ height: "calc(100vh - 120px)" }}
        >
          <IFrame className="h-full w-full" style={{ border: "none" }}>
            <FrameContextConsumer>
              {({ document: frameDocument }) => (
                <CssStyles frameDocument={frameDocument}>
                  <div
                    className="h-full w-full overflow-y-auto bg-white
                      text-gray-900 dark:bg-gray-950 dark:text-gray-50"
                  >
                    <ResolveEditor json={json} />
                  </div>
                </CssStyles>
              )}
            </FrameContextConsumer>
          </IFrame>
        </div>
      )
    }

    return (
      <div className="relative flex min-h-dvh w-full">
        <ResolveEditor json={json} />
      </div>
    )
  }, [effectiveMode, json])

  if (!json) return null

  return (
    <div className="relative flex h-full w-full flex-col">
      {showToggle ? (
        <div className="fixed top-2 left-1/2 z-50 -translate-x-1/2">
          <ToggleGroup
            type="single"
            value={effectiveMode}
            onValueChange={value => {
              if (value) setMode(value as PreviewMode)
            }}
            className="rounded-xl bg-white/80 p-1 shadow backdrop-blur
              dark:bg-gray-900/80"
          >
            <ToggleGroupItem
              value="inline"
              aria-label="Vista escritorio"
              className="gap-2"
            >
              <Monitor className="size-4" />
              <span className="hidden sm:inline">Escritorio</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="iframe"
              aria-label="Vista móvil"
              className="gap-2"
            >
              <Smartphone className="size-4" />
              <span className="hidden sm:inline">Móvil</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      ) : null}

      <div
        className={cn(
          "flex w-full",
          effectiveMode === "iframe" ? "justify-center px-4 pt-20 pb-12" : ""
        )}
      >
        <div
          className={cn(
            "w-full",
            effectiveMode === "iframe" ? "max-w-105" : ""
          )}
        >
          {content}
        </div>
      </div>
    </div>
  )
}
