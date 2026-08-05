"use client"

import { useCallback } from "react"

import { ElasticSlider } from "@/components/elastic-slider"
import { FONT_SIZES } from "@/lib/types/theme"

const SIZES = [...FONT_SIZES].sort((a, b) => a - b)
const MAX_INDEX = SIZES.length - 1

function clampIndex(index: number) {
  return Math.max(0, Math.min(MAX_INDEX, index))
}

/**
 * Font sizes are a fixed, non-uniform scale, so the slider travels over the
 * index of `FONT_SIZES` instead of raw pixels. Values outside the scale (legacy
 * data) resolve to the closest supported size.
 */
function indexForSize(size: number) {
  let nearest = 0
  for (let i = 1; i <= MAX_INDEX; i++) {
    if (Math.abs(SIZES[i]! - size) < Math.abs(SIZES[nearest]! - size)) {
      nearest = i
    }
  }
  return nearest
}

function formatFontSize(index: number) {
  return `${SIZES[clampIndex(Math.round(index))]} px`
}

export function FontSizeSlider({
  label = "Tamaño",
  value,
  onValueChange
}: {
  label?: string
  value: number
  onValueChange: (size: number) => void
}) {
  const handleValueChange = useCallback(
    (index: number) => {
      const size = SIZES[clampIndex(Math.round(index))]!
      if (size !== value) onValueChange(size)
    },
    [onValueChange, value]
  )

  return (
    <ElasticSlider
      label={label}
      value={indexForSize(value)}
      onValueChange={handleValueChange}
      min={0}
      max={MAX_INDEX}
      step={1}
      formatValue={formatFontSize}
    />
  )
}
