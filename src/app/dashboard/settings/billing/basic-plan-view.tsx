"use client"

import { useState } from "react"
import { Gauge } from "@suyalcinkaya/gauge"
import { useTheme } from "next-themes"

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
import { Plan, Tiers } from "@/lib/types"

export function BasicPlanView({ itemCount }: { itemCount: number }) {
  const theme = useTheme()
  const [priceIdLoading, setpriceIdLoading] = useState<string>()

  const handleStripeCheckout = async () => {
    // Get priceId from type of plan
    Tiers.map(tier => {
      if (tier.id === Plan.PRO) {
        console.log(tier.priceMonthlyId)
        setpriceIdLoading(tier.priceMonthlyId)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan</CardTitle>
        <CardDescription>Básico</CardDescription>
      </CardHeader>
      <CardContent>
        <Separator />
        <div className="mt-6 flex flex-row gap-4">
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
      <CardFooter className="justify-end">
        <Button onClick={handleStripeCheckout}>Actualizar a Pro</Button>
      </CardFooter>
    </Card>
  )
}
