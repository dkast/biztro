import Link from "next/link"

import { requireInternalAdmin } from "@/server/actions/internal-admin/guards"

const navigation = [
  { href: "/internal/organizations", label: "Organizaciones" },
  { href: "/internal/users", label: "Usuarios" },
  { href: "/internal/waitlist", label: "Lista de espera" }
]

export default async function InternalLayout({
  children
}: {
  children: React.ReactNode
}) {
  await requireInternalAdmin()

  return (
    <div className="bg-background min-h-dvh">
      <header className="border-border border-b">
        <div
          className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6
            lg:px-8"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p
                className="text-muted-foreground text-xs font-semibold
                  tracking-widest uppercase"
              >
                Biztro interno
              </p>
              <h1 className="text-xl font-semibold">Panel de administración</h1>
            </div>
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground text-sm"
              prefetch={false}
            >
              Volver a la aplicación
            </Link>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label="Administración">
            {navigation.map(item => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="bg-muted hover:bg-accent rounded-md px-3 py-2 text-sm
                  font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
