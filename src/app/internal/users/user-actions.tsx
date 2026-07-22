"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
import { MoreHorizontal } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  banInternalUser,
  setUserRole,
  unbanInternalUser
} from "@/server/actions/internal-admin/mutations"
import { type InternalUser } from "@/server/actions/internal-admin/queries"
import { authClient } from "@/lib/auth-client"

export function UserActions({ user }: { user: InternalUser }) {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [open, setOpen] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [banReason, setBanReason] = useState("")
  const currentRoles =
    session?.user.role?.split(",").map(role => role.trim()) ?? []
  const isSuperuser = currentRoles.includes("superuser")
  const targetIsPrivileged = user.role === "admin" || user.role === "superuser"

  const { execute: execSetRole, reset: resetRole } = useAction(setUserRole, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
        toast.error(data.failure.reason)
      } else {
        toast.success("Rol actualizado")
        router.refresh()
      }
      resetRole()
    },
    onError: () => {
      toast.error("Error al actualizar el rol")
      resetRole()
    }
  })

  const { execute: execBan, reset: resetBan } = useAction(banInternalUser, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
        toast.error(data.failure.reason)
      } else {
        toast.success("Usuario baneado")
        setBanDialogOpen(false)
        setBanReason("")
        router.refresh()
      }
      resetBan()
    },
    onError: () => {
      toast.error("Error al banear al usuario")
      resetBan()
    }
  })

  const { execute: execUnban, reset: resetUnban } = useAction(
    unbanInternalUser,
    {
      onSuccess: ({ data }) => {
        if (data?.failure?.reason) {
          toast.error(data.failure.reason)
        } else {
          toast.success("Usuario desbaneado")
          router.refresh()
        }
        resetUnban()
      },
      onError: () => {
        toast.error("Error al desbanear al usuario")
        resetUnban()
      }
    }
  )

  const handleImpersonate = async () => {
    if (!user.email) {
      toast.error("El usuario no tiene correo electrónico")
      return
    }
    try {
      const result = await authClient.admin.impersonateUser({ userId: user.id })
      if (result.error) {
        toast.error(result.error.message ?? "Error al impersonar al usuario")
        return
      }
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      Sentry.captureException(error, {
        tags: { section: "user-actions", op: "impersonate" }
      })
      toast.error("Error al impersonar al usuario")
    }
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Acciones de usuario</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel
            className="text-muted-foreground max-w-[200px] truncate text-xs
              font-normal"
          >
            {user.email ?? user.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isSuperuser && (
            <>
              <DropdownMenuLabel className="text-xs">
                Cambiar rol
              </DropdownMenuLabel>
              {(["user", "admin", "superuser"] as const).map(r => (
                <DropdownMenuItem
                  key={r}
                  disabled={
                    user.role === r || (user.role === null && r === "user")
                  }
                  onSelect={() => {
                    setOpen(false)
                    execSetRole({ userId: user.id, role: r })
                  }}
                >
                  {r === "user"
                    ? "Usuario"
                    : r === "admin"
                      ? "Admin"
                      : "Superadmin"}
                </DropdownMenuItem>
              ))}
            </>
          )}
          <DropdownMenuSeparator />
          {(!targetIsPrivileged || isSuperuser) && (
            <DropdownMenuItem
              onSelect={() => {
                setOpen(false)
                handleImpersonate()
              }}
            >
              Impersonar
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {user.banned ? (
            <DropdownMenuItem
              disabled={targetIsPrivileged && !isSuperuser}
              onSelect={() => {
                setOpen(false)
                execUnban({ userId: user.id })
              }}
            >
              Desbanear
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-destructive"
              disabled={targetIsPrivileged && !isSuperuser}
              onSelect={() => {
                setOpen(false)
                setBanDialogOpen(true)
              }}
            >
              Banear
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Ban reason dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Banear usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas banear a <strong>{user.name}</strong>?
              Ingresa una razón opcional.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Razón del baneo (opcional)"
            value={banReason}
            onChange={e => setBanReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                execBan({ userId: user.id, reason: banReason || undefined })
              }
            >
              Banear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
