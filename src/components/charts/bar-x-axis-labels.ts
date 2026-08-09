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
  if (labels.length <= 2) return labels

  const widestLabel = labels.reduce(
    (max, item) => Math.max(max, item.label.length),
    0
  )
  const labelWidth = widestLabel * APPROXIMATE_CHARACTER_WIDTH
  const widthLimit = Math.max(
    2,
    Math.floor(plotWidth / (labelWidth + MINIMUM_LABEL_GAP))
  )
  const labelLimit = Math.min(labels.length, maxLabels, widthLimit)

  if (labelLimit >= labels.length) return labels

  return Array.from({ length: labelLimit }, (_, index) => {
    const sourceIndex = Math.round(
      (index * (labels.length - 1)) / (labelLimit - 1)
    )
    return labels[sourceIndex]!
  })
}
