export function resolveBarDomain(
  data: Record<string, unknown>[],
  dataKeys: string[],
  isStacked: boolean
): [number, number] {
  let max = 0

  for (const point of data) {
    let stackedTotal = 0

    for (const key of dataKeys) {
      const value = point[key]
      if (typeof value !== "number") continue

      if (isStacked) {
        stackedTotal += value
      } else if (value > max) {
        max = value
      }
    }

    if (stackedTotal > max) {
      max = stackedTotal
    }
  }

  return [0, (max || 100) * 1.1]
}
