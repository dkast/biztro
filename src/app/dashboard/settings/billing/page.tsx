import { Suspense } from "react"
import { subscriptionsEnabled } from "@/flags"
import { AlertCircle, Wallet } from "lucide-react"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { BasicPlanView } from "@/app/dashboard/settings/billing/basic-plan-view"
import { ProPlanView } from "@/app/dashboard/settings/billing/pro-plan-view"
import { getItemCount } from "@/server/actions/item/queries"
import {
  getCurrentMembership,
  isProMember
} from "@/server/actions/user/queries"
import { MembershipRole } from "@/lib/types"

export default async function BillingPage() {
  const [subsEnabled, membership, isPro, itemCount] = await Promise.all([
    subscriptionsEnabled(),
    getCurrentMembership(),
    isProMember(),
    getItemCount()
  ])

  return (
    <div className="mx-auto max-w-2xl grow px-4 sm:px-0">
      <PageSubtitle
        title="Planes de suscripción"
        description="Maneja tu plan de suscripción e historial de pagos"
        Icon={Wallet}
      />
      {membership?.role === MembershipRole.OWNER && subsEnabled ? (
        <div className="my-10">
          {isPro ? (
            <Suspense fallback={<Skeleton className="h-48" />}>
              <ProPlanView />
            </Suspense>
          ) : (
            <div className="flex flex-col gap-6">
              <Suspense fallback={<Skeleton className="h-48" />}>
                <BasicPlanView itemCount={itemCount} />
              </Suspense>
              {/* <TierSelector /> */}
            </div>
          )}
        </div>
      ) : (
        <Alert className="my-10" variant="warning">
          <AlertCircle className="size-4" />
          <AlertTitle>Aviso</AlertTitle>
          <AlertDescription>
            Solo los miembros propietarios de la organización pueden acceder a
            esta página
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// function TierSelector({ isPro }: { isPro?: boolean }) {
//   return (
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//       {Tiers.map(tier => (
//         <Card key={tier.id} className="flex flex-col justify-between">
//           <CardHeader>
//             <CardTitle>Plan {tier.name}</CardTitle>
//             <CardDescription>{tier.description}</CardDescription>
//           </CardHeader>
//           <CardContent className="grow">
//             <div className="flex flex-col gap-2">
//               {tier.features.map(feature => (
//                 <div
//                   key={feature}
//                   className="flex items-center gap-x-3 text-gray-600 dark:text-gray-300"
//                 >
//                   <CircleCheck className="size-5" />
//                   <span className="text-sm">{feature}</span>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//           <CardFooter>
//             {tier.id === Plan.PRO ? (
//               isPro ? (
//                 <Button className="mt-4 w-full" disabled>
//                   Plan actual
//                 </Button>
//               ) : (
//                 <Button className="mt-4 w-full">Activar plan</Button>
//               )
//             ) : isPro ? (
//               <Button className="mt-4 w-full">Cambiar a este plan</Button>
//             ) : (
//               <Button className="mt-4 w-full" disabled>
//                 Plan actual
//               </Button>
//             )}
//           </CardFooter>
//         </Card>
//       ))}
//     </div>
//   )
// }
