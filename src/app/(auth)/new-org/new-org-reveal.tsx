"use client"

import { createContext, use, useEffect, useRef, useState } from "react"
import { GlimmScope, type GlimmScopeHandle } from "glimm/next"

import { cn } from "@/lib/utils"

const RevealedContext = createContext(true)

export function NewOrgReveal({
  enabled,
  children
}: {
  enabled: boolean
  children: React.ReactNode
}) {
  const scope = useRef<GlimmScopeHandle>(null)
  // Fixed at arrival: creating the organization re-renders the page with
  // enabled=false, and swapping the wrapper would remount the wizard.
  const [isEnabled] = useState(enabled)
  const [isRevealed, setIsRevealed] = useState(!isEnabled)
  // glimm keeps the page inside a WebGL canvas while the page effect is on,
  // and a resize while idle leaves its texture incomplete (renders black).
  // The effect is only needed for the arrival sweep, so drop it afterwards.
  const [isSettled, setIsSettled] = useState(false)

  useEffect(() => {
    if (!isEnabled) return

    // Nobody pressed anything here (arrival from login), so let the page lean
    // in before the change; onFail guarantees the content is never left hidden.
    // The microtask keeps glimm's flushSync out of React's effect phase, and
    // the flag drops the first run of StrictMode's double effect.
    let isCancelled = false
    queueMicrotask(() => {
      if (isCancelled) return
      scope.current?.play({
        anticipate: true,
        change: () => setIsRevealed(true),
        onFail: () => setIsRevealed(true),
        onLeave: () => setIsSettled(true)
      })
    })

    return () => {
      isCancelled = true
    }
  }, [isEnabled])

  if (!isEnabled) return children

  return (
    <RevealedContext value={isRevealed}>
      <GlimmScope
        ref={scope}
        curve={0.12}
        direction="ttb"
        sweepMs={2700}
        pageEffect={!isSettled}
        style={{ position: "fixed", inset: 0 }}
      >
        {/* Opaque base: where HTML-in-Canvas is supported, glimm draws this
            subtree through WebGL without premultiplying alpha, so translucent
            pixels (the page gradients) render as saturated, dithered blobs.
            The two layers repeat the html + body backgrounds from the root
            layout so the page looks the same. */}
        <div className="h-full bg-taupe-100">
          <div
            className="h-full overflow-y-auto bg-taupe-100 dark:bg-taupe-950/95"
          >
            {children}
          </div>
        </div>
      </GlimmScope>
    </RevealedContext>
  )
}

// Hidden until the band passes. Everything else in the scope stays visible
// from arrival so the band has content to gather and ripple.
export function NewOrgRevealContent({
  children
}: {
  children: React.ReactNode
}) {
  const isRevealed = use(RevealedContext)

  return <div className={cn(!isRevealed && "opacity-0")}>{children}</div>
}
