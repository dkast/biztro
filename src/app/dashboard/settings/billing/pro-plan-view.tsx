import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentSubscription } from "@/server/actions/subscriptions/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"

export async function ProPlanView() {
  const org = await getCurrentOrganization()

  if (!org) {
    return null
  }
  const subscription = await getCurrentSubscription(org?.id)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Current Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium capitalize">
              {subscription?.status || "No active subscription"}
            </span>
          </div>
          {subscription && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">PRO</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Started</span>
                <span className="font-medium">
                  {new Date(subscription.created).toLocaleDateString()}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
