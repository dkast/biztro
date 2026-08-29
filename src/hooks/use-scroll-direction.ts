"use client"

import { useEffect, useRef, useState } from "react"

export type ScrollDirection = "up" | "down" | "idle"

const INACTIVITY_MS = 300

export default function useScrollDirection(
  threshold = 5,
  userGesturesOnly = false
): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>("idle")
  const lastY = useRef<number>(0)
  const lastTouchY = useRef<number | null>(null)
  const ticking = useRef<boolean>(false)

  useEffect(() => {
    lastY.current = typeof window !== "undefined" ? window.scrollY : 0

    let rafId: ReturnType<typeof requestAnimationFrame> | null = null
    let inactivityTimer: ReturnType<typeof setTimeout> | null = null

    const updateDirection = (diff: number) => {
      if (Math.abs(diff) < threshold) return

      setDirection(diff > 0 ? "down" : "up")

      if (inactivityTimer !== null) clearTimeout(inactivityTimer)
      inactivityTimer = setTimeout(() => {
        setDirection("idle")
      }, INACTIVITY_MS)
    }

    const onTouchStart = (event: TouchEvent) => {
      lastTouchY.current = event.touches[0]?.clientY ?? null
    }

    const onTouchMove = (event: TouchEvent) => {
      const touchY = event.touches[0]?.clientY
      const previousTouchY = lastTouchY.current
      if (touchY === undefined || previousTouchY === null) return

      const diff = previousTouchY - touchY
      if (Math.abs(diff) < threshold) return

      lastTouchY.current = touchY
      updateDirection(diff)
    }

    const onTouchEnd = () => {
      lastTouchY.current = null
    }

    const onWheel = (event: WheelEvent) => {
      updateDirection(event.deltaY)
    }

    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true

      rafId = requestAnimationFrame(() => {
        const y = window.scrollY
        const diff = y - lastY.current

        if (Math.abs(diff) < threshold) {
          ticking.current = false
          rafId = null
          return
        }

        updateDirection(diff)

        lastY.current = y
        ticking.current = false
        rafId = null
      })
    }

    if (userGesturesOnly) {
      window.addEventListener("touchstart", onTouchStart, { passive: true })
      window.addEventListener("touchmove", onTouchMove, { passive: true })
      window.addEventListener("touchend", onTouchEnd, { passive: true })
      window.addEventListener("touchcancel", onTouchEnd, { passive: true })
      window.addEventListener("wheel", onWheel, { passive: true })
    } else {
      window.addEventListener("scroll", onScroll, { passive: true })
    }

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("touchcancel", onTouchEnd)
      window.removeEventListener("wheel", onWheel)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      if (inactivityTimer !== null) {
        clearTimeout(inactivityTimer)
      }
    }
  }, [threshold, userGesturesOnly])

  return direction
}
