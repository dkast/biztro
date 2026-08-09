import { describe, expect, it } from "vitest"

import { selectBarXAxisLabels } from "../bar-x-axis-labels"

const labels = [
  "9 jul",
  "12 jul",
  "15 jul",
  "18 jul",
  "21 jul",
  "24 jul",
  "27 jul",
  "30 jul",
  "2 ago",
  "5 ago",
  "8 ago"
].map((label, index) => ({ label, x: index * 24 }))

describe("selectBarXAxisLabels", () => {
  it("reduces labels to the available mobile width", () => {
    expect(
      selectBarXAxisLabels(labels, 254, 12).map(item => item.label)
    ).toEqual(["9 jul", "18 jul", "24 jul", "2 ago", "8 ago"])
  })

  it("keeps all labels when the plot has enough room", () => {
    expect(selectBarXAxisLabels(labels, 1032, 12)).toEqual(labels)
  })

  it("preserves the first and last label when applying a limit", () => {
    const selected = selectBarXAxisLabels(labels, 1032, 4)

    expect(selected).toHaveLength(4)
    expect(selected.at(0)).toEqual(labels.at(0))
    expect(selected.at(-1)).toEqual(labels.at(-1))
  })
})
