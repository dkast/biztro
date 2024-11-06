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
import { BasicPlanView } from "@/app/dashboard/settings/billing/basic-plan-view"
import { getItemCount } from "@/server/actions/item/queries"
import { isProMember } from "@/server/actions/user/queries"
import { Plan, Tiers } from "@/lib/types"

export default async function BillingPage() {
  const isPro = await isProMember()
  const itemCount = await getItemCount()
  return (
    <div className="mx-auto max-w-2xl grow px-4 sm:px-0">
      <PageSubtitle
        title="Planes de suscripción"
        description="Maneja tu plan de suscripción e historial de pagos"
        Icon={Wallet}
      />
      <div className="my-10">
        {isPro ? null : (
          <div className="flex flex-col gap-6">
            <BasicPlanView itemCount={itemCount} />
            {/* <TierSelector /> */}
          </div>
        )}
      </div>
    </div>
  )
}

function TierSelector({ isPro }: { isPro?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Tiers.map(tier => (
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
