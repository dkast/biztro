import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CustomerPortalButton } from "@/app/dashboard/settings/billing/customer-portal-button"
import { getCurrentSubscription } from "@/server/actions/subscriptions/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import { Tiers } from "@/lib/types"

export async function ProPlanView() {
  const org = await getCurrentOrganization()

  if (!org) {
    return null
  }
  const subscription = await getCurrentSubscription(org?.id)

  if (!subscription) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Plan</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span>PRO</span>
          {(() => {
            console.log(subscription.status)
            switch (subscription.status) {
              case "trialing":
                return <Badge variant="blue">Prueba</Badge>
              case "active":
                return <Badge variant="green">Activo</Badge>
              case "canceled":
                return <Badge variant="destructive">Cancelado</Badge>
              case "incomplete":
                return <Badge variant="yellow">Incompleto</Badge>
              case "incomplete_Expired":
                return <Badge variant="destructive">Incompleto Expirado</Badge>
              case "past_due":
                return <Badge variant="yellow">Vencido</Badge>
              case "unpaid":
                return <Badge variant="destructive">No Pagado</Badge>
              case "paused":
                return <Badge variant="secondary">Pausado</Badge>
              default:
                return <Badge variant="secondary">Desconocido</Badge>
            }
          })()}
          {subscription.status === "trialing" && (
            <span className="text-sm text-gray-500">
              - Termina el{" "}
              {subscription?.trialEnd
                ? new Date(subscription.trialEnd).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })
                : "N/A"}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* <Separator /> */}
        <div className="mt-2 flex flex-row justify-between gap-4">
          <div>
            <div className="text-sm text-gray-500">Precio</div>
            <div className="text-base font-medium">
              {Tiers.find(t => t.id === org.plan)?.priceMonthly
                ? `${new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN"
                  }).format(
                    Tiers.find(t => t.id === org.plan)?.priceMonthly ?? 0
                  )} MXN/mes`
                : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Activo desde</div>
            <div className="text-base font-medium">
              {subscription?.created
                ? new Date(subscription.created).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })
                : "N/A"}
            </div>
          </div>
          {subscription?.cancelAtPeriodEnd ? (
            <div>
              <div className="text-sm text-gray-500">Cancela el</div>
              <div className="text-base font-medium">
                {subscription?.cancelAt
                  ? new Date(subscription.cancelAt).toLocaleDateString(
                      "es-MX",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      }
                    )
                  : "N/A"}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-sm text-gray-500">Próxima renovación</div>
              <div className="text-base font-medium">
                {subscription?.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString(
                      "es-MX",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      }
                    )
                  : "N/A"}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="items-center justify-between py-4">
        <p className="text-sm text-gray-500">Maneja tu suscripción en Stripe</p>
        <CustomerPortalButton />
      </CardFooter>
    </Card>
  )
}
