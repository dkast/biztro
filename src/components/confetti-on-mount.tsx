"use client"

import { useEffect } from "react"
import confetti from "canvas-confetti"

export default function ConfettiOnMount() {
  useEffect(() => {
    confetti({
      particleCount: 200,
      spread: 180,
      origin: { y: 0.1 },
      ticks: 150
    })
  }, [])

  // This component only triggers the confetti effect on mount and
  // doesn't render any visible DOM nodes.
  return null
}
