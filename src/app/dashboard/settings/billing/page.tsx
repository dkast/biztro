import { CircleCheck, Wallet } from "lucide-react"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { isProMember } from "@/server/actions/user/queries"
import { Plan, tiers } from "@/lib/types"

export default async function BillingPage() {
  const isPro = await isProMember()
  return (
    <div className="mx-auto max-w-2xl grow px-4 sm:px-0">
      <PageSubtitle
        title="Planes de suscripción"
        description="Maneja tu plan de suscripción e historial de pagos"
        Icon={Wallet}
      />
      <div className="my-10">
        <CurrentPlan isPro={isPro} />
      </div>
    </div>
  )
}

function CurrentPlan({ isPro }: { isPro: boolean }) {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle>Plan actual</CardTitle>
        <CardDescription>
          {isPro ? "Plan Pro" : "Plan gratuito"}
        </CardDescription>
      </CardHeader>
      <CardContent className="grow">
        <div className="flex flex-col gap-2">
          {isPro ? (
            <div className="flex items-center gap-x-3 text-gray-600 dark:text-gray-300">
              <CircleCheck className="size-5" />
              <span className="text-sm">
                Acceso a todas las funcionalidades
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-x-3 text-gray-600 dark:text-gray-300">
              <CircleCheck className="size-5" />
              <span className="text-sm">Acceso a 5 proyectos</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {isPro ? (
          <Button className="mt-4 w-full" disabled>
            Plan actual
          </Button>
        ) : (
          <Button className="mt-4 w-full">Activar plan</Button>
        )}
      </CardFooter>
    </Card>
  )
}

function TierSelector({ isPro }: { isPro?: boolean }) {
  return (
    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {tiers.map(tier => (
        <Card key={tier.id} className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Plan {tier.name}</CardTitle>
            <CardDescription>{tier.description}</CardDescription>
          </CardHeader>
          <CardContent className="grow">
            <div className="flex flex-col gap-2">
              {tier.features.map(feature => (
                <div
                  key={feature}
                  className="flex items-center gap-x-3 text-gray-600 dark:text-gray-300"
                >
                  <CircleCheck className="size-5" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            {tier.id === Plan.PRO ? (
              isPro ? (
                <Button className="mt-4 w-full" disabled>
                  Plan actual
                </Button>
              ) : (
                <Button className="mt-4 w-full">Activar plan</Button>
              )
            ) : isPro ? (
              <Button className="mt-4 w-full">Cambiar a este plan</Button>
            ) : (
              <Button className="mt-4 w-full" disabled>
                Plan actual
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
