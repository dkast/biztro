"use client"

import { RefreshCw } from "lucide-react"

import type { LiveConnectionState } from "@/components/orders/use-live-refresh"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function formatAge(ageMs: number) {
  const seconds = Math.floor(ageMs / 1000)
  if (seconds < 60) return `hace ${Math.max(seconds, 1)} s`

  const minutes = Math.floor(seconds / 60)
  return minutes < 60
    ? `hace ${minutes} min`
    : `hace ${Math.floor(minutes / 60)} h`
}

const stateCopy = {
  live: "En vivo",
  syncing: "En vivo",
  stale: "Sin actualizar",
  offline: "Sin conexión"
} as const satisfies Record<LiveConnectionState, string>

export function LiveStatus({
  state,
  ageMs,
  onRetry
}: {
  state: LiveConnectionState
  ageMs: number
  onRetry: () => void
}) {
  const isHealthy = state === "live" || state === "syncing"

  return (
    <div className="flex items-center gap-2">
      <p
        role="status"
        aria-live="polite"
        className={cn(
          "flex items-center gap-2 text-sm font-medium",
          isHealthy ? "text-muted-foreground" : "text-foreground"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "size-2.5 shrink-0 rounded-full",
            isHealthy && "bg-emerald-500",
            state === "stale" && "bg-amber-500",
            state === "offline" && "bg-rose-500"
          )}
        />
        <span>
          {stateCopy[state]}
          {!isHealthy && (
            <span className="text-muted-foreground font-normal">
              {" "}
              · datos de {formatAge(ageMs)}
            </span>
          )}
        </span>
      </p>
      {state === "stale" && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10"
          onClick={onRetry}
        >
          <RefreshCw data-icon="inline-start" />
          Reintentar
        </Button>
      )}
    </div>
  )
}
