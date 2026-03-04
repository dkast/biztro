import { flag } from "flags/next"

export const subscriptionsEnabled = flag({
  key: "enable-suscriptions",
  description: "Enable suscriptions feature",
  decide: () => process.env.FLAGS_ENABLE_SUBSCRIPTIONS === "1",
  defaultValue: false
})

export const simulatePdfAi = flag({
  key: "simulate-pdf-ai",
  description: "Enable simulated PDF AI extraction in dev/testing",
  decide: () => process.env.FLAGS_SIMULATE_PDF_AI === "1",
  defaultValue: true
})

export const precomputedFlags = [subscriptionsEnabled, simulatePdfAi] as const
