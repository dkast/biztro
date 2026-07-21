import Link from "next/link"
import {
  createLoader,
  parseAsBoolean,
  parseAsInteger,
  parseAsString
} from "nuqs/server"

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
  listWaitlistEntries,
  type InternalWaitlistEntry
} from "@/server/actions/internal-admin/queries"
import { WaitlistActions } from "@/app/internal/waitlist/waitlist-actions"
import { WaitlistCreateForm } from "@/app/internal/waitlist/waitlist-create-form"

const loadParams = createLoader({
  search: parseAsString.withDefault(""),
  enabled: parseAsBoolean,
  offset: parseAsInteger.withDefault(0)
})

const LIMIT = 20
const ALL_FILTERS_VALUE = "all"

export default async function WaitlistPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const {
    search,
    enabled: enabledFilter,
    offset
  } = await loadParams(props.searchParams)
  const enabled = enabledFilter === null ? null : enabledFilter
  const result = await listWaitlistEntries({
    search: search || undefined,
    enabled: enabled ?? undefined,
    limit: LIMIT,
    offset
  })

  const totalPages = Math.ceil(result.total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Lista de espera</h2>
          <p className="text-muted-foreground text-sm">
            {result.total} entrada{result.total !== 1 ? "s" : ""} en total
          </p>
        </div>
        <WaitlistCreateForm />
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <Input
          name="search"
          placeholder="Buscar por correo…"
          defaultValue={search}
          className="w-64"
        />
        <Select
          name="enabled"
          defaultValue={
            enabled === true
              ? "true"
              : enabled === false
                ? "false"
                : ALL_FILTERS_VALUE
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL_FILTERS_VALUE}>Todos</SelectItem>
              <SelectItem value="true">Habilitados</SelectItem>
              <SelectItem value="false">Pendientes</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button type="submit" size="sm">
          Filtrar
        </Button>
        {(search || enabled !== null) && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/internal/waitlist">Limpiar</Link>
          </Button>
        )}
      </form>

      {/* Table */}
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="px-4 py-3 text-left font-medium">Correo</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="text-muted-foreground px-4 py-8 text-center"
                >
                  No se encontraron entradas
                </td>
              </tr>
            )}
            {result.items.map((entry: InternalWaitlistEntry) => (
              <tr
                key={entry.id}
                className="hover:bg-muted/30 border-b last:border-0"
              >
                <td className="px-4 py-3 font-medium">{entry.email}</td>
                <td className="px-4 py-3">
                  {entry.enabled ? (
                    <Badge variant="green">Habilitado</Badge>
                  ) : (
                    <Badge variant="yellow">Pendiente</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <WaitlistActions entry={entry} />
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
                  href={`/internal/waitlist?search=${encodeURIComponent(search)}&offset=${Math.max(0, offset - LIMIT)}`}
                >
                  Anterior
                </a>
              </Button>
            )}
            {currentPage < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`/internal/waitlist?search=${encodeURIComponent(search)}&offset=${offset + LIMIT}`}
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
