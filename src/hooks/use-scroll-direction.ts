"use client"

import { useEffect, useRef, useState } from "react"

export type ScrollDirection = "up" | "down" | "idle"

export default function useScrollDirection(threshold = 5): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>("idle")
  const lastY = useRef<number>(0)
  const ticking = useRef<boolean>(false)

  useEffect(() => {
    lastY.current = typeof window !== "undefined" ? window.scrollY : 0

    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true

      requestAnimationFrame(() => {
        const y = window.scrollY
        const diff = y - lastY.current

        if (Math.abs(diff) < threshold) {
          setDirection("idle")
        } else if (diff > 0) {
          setDirection("down")
        } else {
          setDirection("up")
        }

        lastY.current = y
        ticking.current = false
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold])

  return direction
}
