import { ArrowLeft, ShieldCogCorner } from "lucide-react"
import Link from "next/link"

import { PageSubtitle } from "@/components/dashboard/page-subtitle"
import SecondaryNav, {
  type SecondaryNavItem
} from "@/components/dashboard/secondary-nav"
import { requireInternalAdmin } from "@/server/actions/internal-admin/guards"

const navigation = [
  { href: "internal/organizations", title: "Organizaciones" },
  { href: "internal/users", title: "Usuarios" },
  { href: "internal/waitlist", title: "Lista de espera" }
] satisfies SecondaryNavItem[]

export default async function InternalLayout({
  children
}: {
  children: React.ReactNode
}) {
  await requireInternalAdmin()

  return (
    <div className="bg-background min-h-dvh">
      <header>
        <div className="mx-auto flex flex-col gap-4 pt-5">
          <PageSubtitle className="items-center px-0 sm:px-6">
            <PageSubtitle.Icon icon={ShieldCogCorner} />
            <PageSubtitle.Title>Panel de administración</PageSubtitle.Title>
            <PageSubtitle.Description>Biztro interno</PageSubtitle.Description>
            <PageSubtitle.Actions>
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground flex
                  items-center gap-1 text-sm"
                prefetch={false}
              >
                <ArrowLeft className="mr-2 size-4" />
                Volver a la aplicación
              </Link>
            </PageSubtitle.Actions>
          </PageSubtitle>
          <SecondaryNav items={navigation} aria-label="Administración" />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
