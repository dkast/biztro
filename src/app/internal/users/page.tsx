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
  listInternalUsers,
  type InternalUser
} from "@/server/actions/internal-admin/queries"
import { UserActions } from "@/app/internal/users/user-actions"

const loadParams = createLoader({
  search: parseAsString.withDefault(""),
  role: parseAsString.withDefault(""),
  banned: parseAsBoolean,
  offset: parseAsInteger.withDefault(0)
})

const LIMIT = 20

const ROLE_LABELS: Record<string, string> = {
  user: "Usuario",
  admin: "Admin",
  superuser: "Superadmin"
}

function RoleBadge({ role }: { role: string | null }) {
  if (!role || role === "user") return null
  return (
    <Badge variant={role === "superuser" ? "default" : "secondary"}>
      {ROLE_LABELS[role] ?? role}
    </Badge>
  )
}

export default async function UsersPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { search, role, banned, offset } = await loadParams(props.searchParams)
  const result = await listInternalUsers({
    search: search || undefined,
    role: role || undefined,
    banned: banned ?? undefined,
    limit: LIMIT,
    offset
  })

  const totalPages = Math.ceil(result.total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Usuarios</h2>
          <p className="text-muted-foreground text-sm">
            {result.total} usuario{result.total !== 1 ? "s" : ""} en total
          </p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <Input
          name="search"
          placeholder="Buscar por nombre o correo…"
          defaultValue={search}
          className="w-64"
        />
        <select
          name="role"
          defaultValue={role}
          className="border-input bg-background h-9 rounded-md border px-3
            text-sm"
        >
          <option value="">Todos los roles</option>
          <option value="user">Usuario</option>
          <option value="admin">Admin</option>
          <option value="superuser">Superadmin</option>
        </select>
        <select
          name="banned"
          defaultValue={
            banned === true ? "true" : banned === false ? "false" : ""
          }
          className="border-input bg-background h-9 rounded-md border px-3
            text-sm"
        >
          <option value="">Todos</option>
          <option value="false">Activos</option>
          <option value="true">Baneados</option>
        </select>
        <Button type="submit" size="sm">
          Filtrar
        </Button>
        {(search || role || banned !== null) && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/internal/users">Limpiar</Link>
          </Button>
        )}
      </form>

      {/* Table */}
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="px-4 py-3 text-left font-medium">Usuario</th>
              <th className="px-4 py-3 text-left font-medium">Correo</th>
              <th className="px-4 py-3 text-left font-medium">Rol</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Orgs</th>
              <th className="px-4 py-3 text-left font-medium">Creado</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-muted-foreground px-4 py-8 text-center"
                >
                  No se encontraron usuarios
                </td>
              </tr>
            )}
            {result.items.map((user: InternalUser) => (
              <tr
                key={user.id}
                className="hover:bg-muted/30 border-b last:border-0"
              >
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="text-muted-foreground px-4 py-3">
                  {user.email ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={user.role} />
                  {!user.role || user.role === "user" ? (
                    <span className="text-muted-foreground text-xs">
                      Usuario
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  {user.banned ? (
                    <Badge variant="destructive">Baneado</Badge>
                  ) : (
                    <Badge variant="outline">Activo</Badge>
                  )}
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  {user._count.members}
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  {user.createdAt.toLocaleDateString("es-MX")}
                </td>
                <td className="px-4 py-3 text-right">
                  <UserActions user={user} />
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
                  href={`/internal/users?search=${search}&role=${role}&offset=${Math.max(0, offset - LIMIT)}`}
                >
                  Anterior
                </a>
              </Button>
            )}
            {currentPage < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`/internal/users?search=${search}&role=${role}&offset=${offset + LIMIT}`}
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
