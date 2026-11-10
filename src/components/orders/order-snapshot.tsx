"use client"

import { useState, useTransition } from "react"
import { CircleAlert, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { OrderSnapshotResult } from "@/lib/types/order"
import { cn } from "@/lib/utils"

// Keeps the last successful snapshot mounted while a refresh fails.
export function useOrderSnapshot<T>(snapshot: OrderSnapshotResult<T>) {
  const [lastData, setLastData] = useState<T | null>(
    snapshot.status === "success" ? snapshot.data : null
  )

  if (snapshot.status === "success" && snapshot.data !== lastData) {
    setLastData(snapshot.data)
  }

  return {
    data: snapshot.status === "success" ? snapshot.data : lastData,
    hasError: snapshot.status === "error"
  }
}

export function OrderSnapshotUnavailable() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <Alert variant="destructive">
      <CircleAlert aria-hidden />
      <AlertTitle>No se pudieron cargar las órdenes</AlertTitle>
      <AlertDescription className="flex flex-col items-start gap-3">
        Revisa tu conexión e inténtalo de nuevo.
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => startTransition(() => router.refresh())}
        >
          <RefreshCw aria-hidden className={cn(isPending && "animate-spin")} />
          Reintentar
        </Button>
      </AlertDescription>
    </Alert>
  )
}
