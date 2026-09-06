import { describe, expect, it, vi } from "vitest"

import { analyzeMenuVisualPackage, extractMenuItemsFromFile } from "../ai"

vi.hoisted(() => {
  process.env.SKIP_ENV_VALIDATION = "1"
})

const simulatedImageInput = {
  fileBase64: "dGVzdA==",
  mimeType: "image/png" as const,
  simulateResponse: true
}

describe("menu import AI simulation", () => {
  it("extracts structured menu items without calling the Gateway", async () => {
    const items = await extractMenuItemsFromFile({
      ...simulatedImageInput,
      simulateScenario: "variants"
    })

    expect(items).toHaveLength(4)
    expect(items[0]).toMatchObject({
      name: "Hamburguesa Clásica",
      variantName: "Sencilla",
      price: 119,
      needsReview: false
    })
  })

  it("analyzes a structured visual package without calling the Gateway", async () => {
    const visualPackage = await analyzeMenuVisualPackage({
      ...simulatedImageInput,
      simulateScenario: "default"
    })

    expect(visualPackage).toMatchObject({
      menuName: "Menú importado",
      presetSource: "imagePreset",
      imagePresetId: "img-mexicano",
      colorThemeId: "MOSTAZA_DARK",
      backgroundImage: "bg-center-molcajete-1.jpg"
    })
  })
})
