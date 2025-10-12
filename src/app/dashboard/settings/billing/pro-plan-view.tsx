import { AlertCircle, HeartHandshake } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getCurrentSubscription } from "@/server/actions/subscriptions/queries"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import { CustomerPortalButton } from "@/app/dashboard/settings/billing/customer-portal-button"
import { SubscriptionStatus, Tiers } from "@/lib/types"

export async function ProPlanView() {
  const org = await getCurrentOrganization()

  if (!org) {
    return null
  }
  const subscription = await getCurrentSubscription(org?.id)

  if (org.status === SubscriptionStatus.SPONSORED) {
    return (
      <Alert variant="success">
        <HeartHandshake className="size-5" />
        <AlertTitle>Organización patrocinada</AlertTitle>
        <AlertDescription>
          Tu organización está en un plan PRO patrocinado. Disfruta de todas las
          funciones de Biztro Pro sin costo alguno.
        </AlertDescription>
      </Alert>
    )
  }

  if (!subscription) {
    return null
  }

  return (
    <div className="rounded-xl bg-gray-50 dark:bg-gray-900">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>PRO</span>
            {(() => {
              switch (subscription.status) {
                case "trialing":
                  return <Badge variant="violet">Prueba</Badge>
                case "active":
                  return <Badge variant="green">Activo</Badge>
                case "canceled":
                  return <Badge variant="destructive">Cancelado</Badge>
                case "incomplete":
                  return <Badge variant="yellow">Incompleto</Badge>
                case "incomplete_expired":
                  return (
                    <Badge variant="destructive">Incompleto Expirado</Badge>
                  )
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
                  ? new Date(subscription.trialEnd).toLocaleDateString(
                      "es-MX",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      }
                    )
                  : "N/A"}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* <Separator /> */}
          <div className="mt-2 flex flex-row justify-between gap-4">
            <div>
              <div className="text-sm text-gray-500">Precio</div>
              <div className="text-base font-medium">
                {(() => {
                  const tier = Tiers.find(
                    t =>
                      t.priceMonthlyId === subscription.priceId ||
                      t.priceYearlyId === subscription.priceId
                  )
                  if (!tier) return "N/A"
                  const isMonthly = tier.priceMonthlyId === subscription.priceId
                  const price = isMonthly ? tier.priceMonthly : tier.priceYearly
                  return `${new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN"
                  }).format(price)} MXN/${isMonthly ? "mes" : "año"}`
                })()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Periodo activo</div>
              <div className="text-base font-medium">
                {subscription?.periodStart
                  ? new Date(subscription.periodStart).toLocaleDateString(
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
            {subscription?.cancelAtPeriodEnd ? (
              <div>
                <div className="text-sm text-gray-500">Cancela el</div>
                <div className="text-base font-medium">
                  {subscription?.periodEnd
                    ? new Date(subscription.periodEnd).toLocaleDateString(
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
                  {subscription?.periodEnd
                    ? new Date(subscription.periodEnd).toLocaleDateString(
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
          {subscription?.cancelAtPeriodEnd && (
            <Alert variant="warning" className="mt-4">
              <AlertCircle className="size-4" />
              <AlertTitle>Suscripción programada para finalizar</AlertTitle>
              <AlertDescription>
                Tu suscripción está configurada para terminar el{" "}
                {subscription?.periodEnd
                  ? new Date(subscription.periodEnd).toLocaleDateString(
                      "es-MX",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      }
                    )
                  : "N/A"}
                . Tendrás acceso hasta esa fecha. Si deseas reactivar tu
                suscripción, ve al portal de pagos.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <Separator />
        <CardFooter className="items-center justify-between py-4">
          <p className="text-sm text-gray-500">
            Maneja tu suscripción en Stripe
          </p>
          <CustomerPortalButton referenceId={org.id} />
        </CardFooter>
      </Card>
      <div className="w-full px-4 py-2 text-sm text-gray-400 dark:text-gray-600">
        ¿Tienes algún problema con tu suscripción? Envía un correo a{" "}
        <a
          href="mailto:contacto@biztro.co"
          className="text-violet-500 hover:underline"
        >
          contacto@biztro.co
        </a>
      </div>
    </div>
  )
}
