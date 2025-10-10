import { Suspense } from "react"
import { subscriptionsEnabled } from "@/flags"
import { AlertCircle, Wallet } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { getItemCount } from "@/server/actions/item/queries"
import {
  getCurrentMembershipRole,
  getCurrentOrganization,
  isProMember
} from "@/server/actions/user/queries"
import { BasicPlanView } from "@/app/dashboard/settings/billing/basic-plan-view"
import { ProPlanView } from "@/app/dashboard/settings/billing/pro-plan-view"
import RevalidateStatus from "@/app/dashboard/settings/billing/revalidate-status"
import { MembershipRole } from "@/lib/types"

export const metadata: Metadata = {
  title: "Suscripción"
}

export default async function BillingPage() {
  const [subsEnabled, role, isPro, itemCount, currentOrg] = await Promise.all([
    subscriptionsEnabled(),
    getCurrentMembershipRole(),
    isProMember(),
    getItemCount(),
    getCurrentOrganization()
  ])

  if (!currentOrg) {
    return notFound()
  }

  return (
    <div className="mx-auto max-w-2xl grow px-4 sm:px-0">
      <PageSubtitle
        title="Planes de suscripción"
        description="Maneja tu plan de suscripción e historial de pagos"
        Icon={Wallet}
      />
      {role === MembershipRole.OWNER && subsEnabled ? (
        <div className="my-10">
          {isPro ? (
            <Suspense fallback={<Skeleton className="h-48" />}>
              <ProPlanView />
              <RevalidateStatus />
            </Suspense>
          ) : (
            <div className="flex flex-col gap-6">
              <Suspense fallback={<Skeleton className="h-48" />}>
                <BasicPlanView itemCount={itemCount} />
              </Suspense>
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
