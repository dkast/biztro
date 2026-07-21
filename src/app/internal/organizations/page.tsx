import Link from "next/link"
import { createLoader, parseAsInteger, parseAsString } from "nuqs/server"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  listInternalOrganizations,
  type InternalOrg
} from "@/server/actions/internal-admin/queries"
import { OrgActions } from "@/app/internal/organizations/org-actions"

const loadParams = createLoader({
  search: parseAsString.withDefault(""),
  plan: parseAsString.withDefault(""),
  status: parseAsString.withDefault(""),
  offset: parseAsInteger.withDefault(0)
})

const LIMIT = 20
const ALL_FILTERS_VALUE = "all"

const PLAN_LABELS: Record<string, string> = {
  BASIC: "Básico",
  PRO: "Pro"
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  TRIALING: "Prueba",
  SPONSORED: "Patrocinado",
  CANCELED: "Cancelado",
  PAST_DUE: "Vencido",
  PAUSED: "Pausado"
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "SPONSORED"
      ? "indigo"
      : status === "ACTIVE"
        ? "green"
        : status === "TRIALING" || status === "PAST_DUE"
          ? "yellow"
          : status === "CANCELED"
            ? "destructive"
            : "default"
  return <Badge variant={variant}>{STATUS_LABELS[status] ?? status}</Badge>
}

function PlanBadge({ plan }: { plan: string }) {
  return (
    <Badge variant={plan === "PRO" ? "blue" : "default"}>
      {PLAN_LABELS[plan] ?? plan}
    </Badge>
  )
}

function EntitlementBadge({
  entitlement
}: {
  entitlement: InternalOrg["effectiveEntitlement"]
}) {
  const labels = {
    BASIC: "Basic",
    PAID_PRO: "Pro (Stripe)",
    SPONSORED: "Pro patrocinado"
  } as const

  return (
    <Badge
      variant={
        entitlement === "PAID_PRO"
          ? "blue"
          : entitlement === "SPONSORED"
            ? "indigo"
            : "default"
      }
    >
      {labels[entitlement]}
    </Badge>
  )
}

export default async function OrganizationsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const {
    search,
    plan: planFilter,
    status: statusFilter,
    offset
  } = await loadParams(props.searchParams)
  const plan = planFilter === ALL_FILTERS_VALUE ? "" : planFilter
  const status = statusFilter === ALL_FILTERS_VALUE ? "" : statusFilter
  const result = await listInternalOrganizations({
    search: search || undefined,
    plan: plan || undefined,
    status: status || undefined,
    limit: LIMIT,
    offset
  })

  const totalPages = Math.ceil(result.total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Organizaciones</h2>
          <p className="text-muted-foreground text-sm">
            {result.total} organización{result.total !== 1 ? "es" : ""} en total
          </p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <Input
          name="search"
          placeholder="Buscar por nombre o slug…"
          defaultValue={search}
          className="w-64"
        />
        <Select name="plan" defaultValue={plan || ALL_FILTERS_VALUE}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos los planes" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL_FILTERS_VALUE}>
                Todos los planes
              </SelectItem>
              <SelectItem value="BASIC">Básico</SelectItem>
              <SelectItem value="PRO">Pro</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select name="status" defaultValue={status || ALL_FILTERS_VALUE}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL_FILTERS_VALUE}>
                Todos los estados
              </SelectItem>
              <SelectItem value="ACTIVE">Activo</SelectItem>
              <SelectItem value="TRIALING">Prueba</SelectItem>
              <SelectItem value="SPONSORED">Patrocinado</SelectItem>
              <SelectItem value="CANCELED">Cancelado</SelectItem>
              <SelectItem value="PAST_DUE">Vencido</SelectItem>
              <SelectItem value="PAUSED">Pausado</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button type="submit" size="sm">
          Filtrar
        </Button>
        {(search || plan || status) && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/internal/organizations">Limpiar</Link>
          </Button>
        )}
      </form>

      {/* Table */}
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="px-4 py-3 text-left font-medium">Nombre</th>
              <th className="px-4 py-3 text-left font-medium">Slug</th>
              <th className="px-4 py-3 text-left font-medium">
                Acceso efectivo
              </th>
              <th className="px-4 py-3 text-left font-medium">Plan</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Miembros</th>
              <th className="px-4 py-3 text-left font-medium">Creada</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-muted-foreground px-4 py-8 text-center"
                >
                  No se encontraron organizaciones
                </td>
              </tr>
            )}
            {result.items.map((org: InternalOrg) => (
              <tr
                key={org.id}
                className="hover:bg-muted/30 border-b last:border-0"
              >
                <td className="px-4 py-3 font-medium">{org.name}</td>
                <td className="text-muted-foreground px-4 py-3">
                  {org.slug ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <EntitlementBadge entitlement={org.effectiveEntitlement} />
                </td>
                <td className="px-4 py-3">
                  <PlanBadge plan={org.plan} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={org.status} />
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  {org._count.members}
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  {org.createdAt.toLocaleDateString("es-MX")}
                </td>
                <td className="px-4 py-3 text-right">
                  <OrgActions org={org} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`/internal/organizations?search=${search}&plan=${plan}&status=${status}&offset=${Math.max(0, offset - LIMIT)}`}
                >
                  Anterior
                </a>
              </Button>
            )}
            {currentPage < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`/internal/organizations?search=${search}&plan=${plan}&status=${status}&offset=${offset + LIMIT}`}
                >
                  Siguiente
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
