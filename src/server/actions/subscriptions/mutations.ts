"use server"

import { auth } from "@/auth"
import type Stripe from "stripe"

import prisma from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { calculateTrialEndUnixTimestamp, getBaseUrl } from "@/lib/utils"

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

const createCustomerInStripe = async (id: string, email: string) => {
  const customerData = {
    metadata: {
      membershipId: id,
      email
    }
  }

  const newCustomer = await stripe.customers.create(customerData)
  if (!newCustomer.id) {
    throw new Error("Error creating customer")
  }

  return newCustomer.id
}

const createOrRetrieveCustomer = async (email: string, id: string) => {
  // Check if the customer exists in the database
  const customer = await prisma.customer.findFirst({
    where: {
      membershipId: id
    }
  })

  // Retrieve the customer from Stripe
  let stripeCustomerId: string | undefined
  if (customer?.stripeCustomerId) {
    const stripeCustomer = await stripe.customers.retrieve(
      customer.stripeCustomerId
    )
    stripeCustomerId = stripeCustomer.id
  } else {
    // Try retrieving the customer from Stripe using the email
    const stripeCustomer = await stripe.customers.list({
      email,
      limit: 1
    })
    stripeCustomerId = stripeCustomer.data[0]?.id
  }

  // If customer is not found in the database or Stripe, create a new customer
  const stripeIdToInsert = stripeCustomerId
    ? stripeCustomerId
    : await createCustomerInStripe(id, email)
  if (!stripeIdToInsert) {
    throw new Error("Error creating customer")
  }

  if (customer && stripeCustomerId) {
    if (customer.stripeCustomerId !== stripeCustomerId) {
      await prisma.customer.update({
        where: {
          membershipId: id
        },
        data: {
          stripeCustomerId
        }
      })
    }

    return stripeCustomerId
  } else {
    // Upsert the customer in the database
    await prisma.customer.upsert({
      where: {
        membershipId: id
      },
      create: {
        membershipId: id,
        stripeCustomerId: stripeIdToInsert
      },
      update: {
        membershipId: id,
        stripeCustomerId: stripeIdToInsert
      }
    })

    return stripeIdToInsert
  }
}

type CheckoutResponse = {
  errorRedirect?: string
  sessionId?: string
}

export const checkoutWithStripe = async (
  priceId: string,
  redirectPath: string
): Promise<CheckoutResponse> => {
  try {
    // Get the user's membership id
    const session = await auth()
    const membership = await prisma.membership.findFirst({
      where: {
        userId: session?.user.id,
        isActive: true
      }
    })

    if (!membership) {
      throw new Error("Membership not found")
    }

    // Retrieve or create the customer in Stripe
    let customer: string
    try {
      customer = await createOrRetrieveCustomer(
        session?.user?.email ?? "",
        membership.id
      )
    } catch (error) {
      console.error(error)
      throw new Error("Unable to access customer record")
    }

    const params: Stripe.Checkout.SessionCreateParams = {
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer,
      customer_update: {
        address: "auto"
      },
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      cancel_url: getBaseUrl(),
      success_url: getBaseUrl() + redirectPath,
      mode: "subscription",
      subscription_data: {
        trial_end: calculateTrialEndUnixTimestamp(7)
      }
    }

    let stripeSession: Stripe.Checkout.Session
    try {
      stripeSession = await stripe.checkout.sessions.create(params)
    } catch (error) {
      console.error(error)
      throw new Error("Error creating checkout session")
    }

    if (stripeSession.id) {
      return { sessionId: stripeSession.id }
    } else {
      throw new Error("Error creating checkout session")
    }
  } catch (error) {
    console.error(error)
    return { errorRedirect: redirectPath }
  }
}
