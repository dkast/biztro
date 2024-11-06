"use server"

import prisma from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export const manageSubscriptionStatusChnage = async (
  stripeSubscriptionId: string,
  customerId: string
) => {
  // Get the customer with the customer id from database
  const customer = await prisma.customer.findUnique({
    where: {
      stripeCustomerId: customerId
    }
  })

  if (!customer) {
    throw new Error("Customer not found")
  }

  const subscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionId,
    {
      expand: ["default_payment_method"]
    }
  )

  // Upsert the subscription in the database
  await prisma.subscription.upsert({
    where: {
      id: stripeSubscriptionId
    },
    create: {
      membership: { connect: { id: customer.membershipId } },
      id: stripeSubscriptionId,
      metadata: JSON.stringify(subscription.metadata),
      status: subscription.status,
      priceId: subscription.items.data[0]?.price.id,
      // @ts-expect-error - quantity is not present in the type definition
      quantity: subscription.quantity,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      cancelAt: subscription.cancel_at
        ? new Date(subscription.cancel_at)
        : null,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at)
        : null,
      currentPeriodStart: new Date(subscription.current_period_start),
      currentPeriodEnd: new Date(subscription.current_period_end),
      endedAt: subscription.ended_at ? new Date(subscription.ended_at) : null,
      trialStart: subscription.trial_start
        ? new Date(subscription.trial_start)
        : null,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end) : null
    },
    update: {
      membership: { connect: { id: customer.membershipId } },
      metadata: JSON.stringify(subscription.metadata),
      status: subscription.status,
      priceId: subscription.items.data[0]?.price.id,
      // @ts-expect-error - quantity is not present in the type definition
      quantity: subscription.quantity,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      cancelAt: subscription.cancel_at
        ? new Date(subscription.cancel_at)
        : null,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at)
        : null,
      currentPeriodStart: new Date(subscription.current_period_start),
      currentPeriodEnd: new Date(subscription.current_period_end),
      created: new Date(subscription.created),
      endedAt: subscription.ended_at ? new Date(subscription.ended_at) : null,
      trialStart: subscription.trial_start
        ? new Date(subscription.trial_start)
        : null,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end) : null
    }
  })
}
