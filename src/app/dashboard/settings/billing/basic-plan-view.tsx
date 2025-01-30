"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { Gauge } from "@suyalcinkaya/gauge"
import { Loader } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { checkoutWithStripe } from "@/server/actions/subscriptions/mutations"
import { appConfig } from "@/app/config"
import { getStripeClient } from "@/lib/stripe-client"
import { Plan, Tiers } from "@/lib/types"

export function BasicPlanView({ itemCount }: { itemCount: number }) {
  const theme = useTheme()
  const router = useRouter()
  const [priceIdLoading, setpriceIdLoading] = useState<string>()
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    "monthly"
  )

  const handleStripeCheckout = async () => {
    const tier = Tiers.find(tier => tier.id === Plan.PRO)

    if (!tier) {
      throw new Error("Tier not found")
    }

    const priceId =
      billingInterval === "monthly" ? tier.priceMonthlyId : tier.priceYearlyId

    setpriceIdLoading(priceId)

    const { errorRedirect, sessionId } = await checkoutWithStripe(
      priceId,
      "/dashboard/settings/billing"
    )

    if (errorRedirect) {
      setpriceIdLoading(undefined)
      return router.push(errorRedirect)
    }

    if (!sessionId) {
      setpriceIdLoading(undefined)
      toast.error("Error al crear la sesión de pago")
      return null
    }

    const stripe = await getStripeClient()
    stripe?.redirectToCheckout({ sessionId })

    setpriceIdLoading(undefined)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan</CardTitle>
        <CardDescription>Básico</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-2 flex flex-row gap-4">
          <div className="hidden sm:block">
            <Gauge
              value={itemCount * 10}
              showAnimation
              size="sm"
              primary="#8b5cf6"
              secondary={theme.resolvedTheme === "dark" ? "#212121" : "#cfcfcf"}
            />
          </div>
          <div className="flex flex-col justify-center gap-1">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Has consumido {itemCount} de los {appConfig.itemLimit} productos
              disponibles en tu plan
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Actualiza tu plan para agregar más productos a tu menú y disfrutar
              de más beneficios.
            </p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-start-2">
            <ToggleGroup
              type="single"
              value={billingInterval}
              onValueChange={value =>
                value && setBillingInterval(value as "monthly" | "yearly")
              }
              className="justify-center"
            >
              <ToggleGroupItem value="monthly" className="text-sm">
                Mensual
              </ToggleGroupItem>
              <ToggleGroupItem value="yearly" className="text-sm">
                Anual
                <span className="ml-1.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-900 dark:text-green-300">
                  -10%
                </span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          {Tiers.map(tier => (
            <Card
              key={tier.id}
              className={
                tier.id === Plan.PRO
                  ? "border-violet-500 dark:border-violet-500"
                  : "hidden border-dashed sm:block"
              }
            >
              <CardHeader>
                <div>
                  <CardTitle className="text-sm">
                    {`Plan ${tier.name}`}
                  </CardTitle>
                  {tier.id === Plan.PRO ? (
                    <div className="mt-1 text-sm">
                      {billingInterval === "monthly"
                        ? `${new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(tier.priceMonthly)} MXN/mes`
                        : `${new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(tier.priceYearly)} MXN/año`}
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-gray-500">Gratis</div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {tier.features.map(feature => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="justify-end py-4">
        <Button
          disabled={priceIdLoading !== undefined}
          onClick={handleStripeCheckout}
        >
          {priceIdLoading ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            `Actualizar a Pro ${billingInterval === "monthly" ? "Mensual" : "Anual"}`
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
