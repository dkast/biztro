import Stripe from "stripe"

import { env } from "@/env.mjs"

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  //@ts-expect-error - This is a valid option
  apiVersion: "2020-08-27"
})
