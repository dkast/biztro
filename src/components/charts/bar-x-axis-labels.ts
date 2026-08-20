export type BarXAxisLabelItem = {
  label: string
  x: number
}

const APPROXIMATE_CHARACTER_WIDTH = 7
const MINIMUM_LABEL_GAP = 8

export function selectBarXAxisLabels(
  labels: BarXAxisLabelItem[],
  plotWidth: number,
  maxLabels: number
): BarXAxisLabelItem[] {
  const safeMaxLabels = Math.max(0, maxLabels)

  if (labels.length <= 2) return labels.slice(0, safeMaxLabels)

  const widestLabel = labels.reduce(
    (max, item) => Math.max(max, item.label.length),
    0
  )
  const labelWidth = widestLabel * APPROXIMATE_CHARACTER_WIDTH
  const widthLimit = Math.max(
    2,
    Math.floor(plotWidth / (labelWidth + MINIMUM_LABEL_GAP))
  )
  const labelLimit = Math.min(labels.length, safeMaxLabels, widthLimit)

  if (labelLimit <= 1) return labels.slice(0, labelLimit)

  if (labelLimit >= labels.length) return labels

  return Array.from({ length: labelLimit }, (_, index) => {
    const sourceIndex = Math.round(
      (index * (labels.length - 1)) / (labelLimit - 1)
    )
    return labels[sourceIndex]!
  })
}
