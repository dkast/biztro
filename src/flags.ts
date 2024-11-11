import { unstable_flag as flag } from "@vercel/flags/next"

export const subscriptionsEnabled = flag({
  key: "enable-suscriptions",
  description: "Enable suscriptions feature",
  decide: () => process.env.FLAGS_ENABLE_SUBSCRIPTIONS === "1",
  defaultValue: false
})

export const precomputedFlags = [subscriptionsEnabled] as const
