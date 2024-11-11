import { loadStripe, type Stripe } from "@stripe/stripe-js"

import { env } from "@/env.mjs"

let stripePromise: Promise<Stripe | null>

export const getStripeClient = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  }

  return stripePromise
}
