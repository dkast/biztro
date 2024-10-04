import { notFound } from "next/navigation"
import type { Metadata } from "next/types"

import { EmptyState } from "@/components/dashboard/empty-state"
import PageHeader from "@/components/dashboard/page-header"
import PageSubtitle from "@/components/dashboard/page-subtitle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { getCurrentMembership } from "@/server/actions/user/queries"
import { getCurrentUser } from "@/lib/session"
import { MembershipRole } from "@/lib/types"
import { getInitials } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Mi Perfil"
}

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) return notFound()

  const membership = await getCurrentMembership()

  const roleLabel = (() => {
    switch (membership?.role) {
      case MembershipRole.ADMIN:
        return "Administrador"
      case MembershipRole.MEMBER:
        return "Miembro"
      case MembershipRole.OWNER:
        return "Propietario"
      default:
        return ""
    }
  })()

  return (
    <>
      <PageHeader title="Mi Perfil" />
      <div className="flex grow py-4">
        <div className="mx-auto max-w-2xl grow px-4 sm:px-0">
          <PageSubtitle
            title="Datos generales"
            description="Información general sobre mi cuenta"
          />
          <div className="relative my-6 rounded-xl bg-gradient-to-t from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
            <div className="bg-dot-pattern dark:bg-dot-pattern-white absolute inset-0 size-full" />
            <div className="absolute inset-0 size-full rounded-xl bg-gradient-to-t from-gray-50 via-gray-100/50 to-gray-200/90 dark:from-gray-950" />
            <div className="flex h-36 items-center overflow-hidden px-7">
              <Avatar className="size-20 shadow-lg">
                {user.image && <AvatarImage src={user.image} />}
                <AvatarFallback className="text-2xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="relative pb-8 pl-8 pr-8">
              <h3 className="text-xl font-semibold leading-none">
                {user.name}
              </h3>
              <p className="mt-1.5 font-medium leading-none text-gray-600 dark:text-gray-400">
                {user.email}
              </p>
            </div>
          </div>
          <div>
            <PageSubtitle
              title="Membresía actual"
              description="Información sobre tu membresía actual"
            />
            <div className="mt-6">
              {membership ? (
                <div className="grid grid-cols-1 gap-6 rounded-lg border px-6 py-3 dark:border-gray-800 sm:grid-cols-2">
                  <div>
                    <Label>Organización</Label>
                    <h4 className="text-gray-500">
                      {membership.organization.name}
                    </h4>
                  </div>
                  <div>
                    <Label>Rol</Label>
                    <p className="text-gray-500">{roleLabel}</p>
                  </div>
                </div>
              ) : (
                <EmptyState title="No tienes membresía en ninguna organización" />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
