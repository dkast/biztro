import prisma from "@/lib/prisma"

// Get the current active subscription in the organization
export const getCurrentSubscription = async (organizationId: string) => {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      organizationId
    },
    orderBy: {
      created: "desc"
    },
    take: 1
  })

  return subscriptions[0]
}
