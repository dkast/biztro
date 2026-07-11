"use client"

import { useSyncExternalStore } from "react"

const emptySubscribe = () => () => {}

export function useScrollFadeSupport() {
  return useSyncExternalStore(
    emptySubscribe,
    () => {
      if (typeof window === "undefined" || typeof window.CSS === "undefined") {
        return false
      }

      return (
        window.CSS.supports("mask-image", "linear-gradient(black, black)") &&
        window.CSS.supports("animation-timeline", "scroll(self)") &&
        (window.CSS.supports("mask-composite", "exclude") ||
          window.CSS.supports("-webkit-mask-composite", "xor"))
      )
    },
    () => false
  )
}
