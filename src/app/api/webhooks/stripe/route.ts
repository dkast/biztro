import type { NextApiResponse } from "next"
import type Stripe from "stripe"

import { manageSubscriptionStatusChnage } from "@/server/actions/subscriptions/mutations"
import { stripe } from "@/lib/stripe"
import { env } from "@/env.mjs"

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted"
])

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!
  const body = await req.text()

  let event: Stripe.Event

  if (!sig) {
    return new Response("No signature", { status: 400 })
  }

  try {
    event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET)
  } catch (err: Error | unknown) {
    console.error(err)
    return new Response(`Webhook Error: ${(err as Error).message}`, {
      status: 400
    })
  }

  if (!relevantEvents.has(event.type)) {
    return new Response(null, { status: 200 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === "subscription") {
          await manageSubscriptionStatusChnage(
            session.subscription as string,
            session.customer as string
          )
        }
        break
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription
        await manageSubscriptionStatusChnage(
          subscription.id,
          subscription.customer as string
        )
        break
    }

    return new Response(JSON.stringify({ received: true }))
  } catch (err: Error | unknown) {
    console.error(err)
    return new Response(`Error processing event: ${(err as Error).message}`, {
      status: 500
    })
  }
}
