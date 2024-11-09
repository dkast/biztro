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
import { appConfig } from "@/app/config"
import { checkoutWithStripe } from "@/server/actions/subscriptions/mutations"
import { getStripeClient } from "@/lib/stripe-client"
import { Plan, Tiers } from "@/lib/types"

export function BasicPlanView({ itemCount }: { itemCount: number }) {
  const theme = useTheme()
  const router = useRouter()
  const [priceIdLoading, setpriceIdLoading] = useState<string>()

  const handleStripeCheckout = async () => {
    // Get priceId from type of plan

    const tier = Tiers.find(tier => tier.id === Plan.PRO)

    if (!tier) {
      throw new Error("Tier not found")
    }

    setpriceIdLoading(tier.priceMonthlyId)

    const { errorRedirect, sessionId } = await checkoutWithStripe(
      tier.priceMonthlyId,
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
        {/* <Separator /> */}
        <div className="mt-2 flex flex-row gap-4">
          <div className="hidden sm:block">
            <Gauge
              value={itemCount * 10}
              showAnimation
              size="sm"
              primary="#2563eb"
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
            "Actualizar a Pro"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
