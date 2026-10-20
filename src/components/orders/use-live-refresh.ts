"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { kitchenRefreshIntervalMs, kitchenStaleAfterMs } from "@/lib/orders"

export type LiveConnectionState = "live" | "syncing" | "stale" | "offline"

/**
 * Keeps a server-rendered operational view fresh by refreshing the route while
 * the tab is visible, and reports how old the confirmed snapshot is.
 */
export function useLiveRefresh(serverTime: string) {
  const router = useRouter()
  const [isRefreshing, startRefresh] = useTransition()
  const [isOnline, setIsOnline] = useState(true)
  const [now, setNow] = useState(() => Date.parse(serverTime))
  const [syncedAt, setSyncedAt] = useState(() => Date.parse(serverTime))
  const isRefreshingRef = useRef(false)

  useEffect(() => {
    isRefreshingRef.current = isRefreshing
  }, [isRefreshing])

  // Measure freshness on the client clock so device clock skew cannot mark a
  // live snapshot as stale.
  useEffect(() => {
    const receivedAt = Date.now()
    setSyncedAt(receivedAt)
    setNow(receivedAt)
  }, [serverTime])

  const refresh = useCallback(() => {
    if (isRefreshingRef.current || !navigator.onLine) return

    startRefresh(() => router.refresh())
  }, [router])

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const tick = () => {
      setNow(Date.now())
      if (document.visibilityState === "visible") refresh()
    }
    const handleOnline = () => {
      setIsOnline(true)
      refresh()
    }
    const handleOffline = () => {
      setIsOnline(false)
      setNow(Date.now())
    }
    const handleVisibility = () => {
      if (document.visibilityState === "visible") tick()
    }

    const interval = window.setInterval(tick, kitchenRefreshIntervalMs)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    window.addEventListener("focus", handleVisibility)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("focus", handleVisibility)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [refresh])

  const ageMs = Math.max(0, now - syncedAt)
  const state: LiveConnectionState = !isOnline
    ? "offline"
    : ageMs > kitchenStaleAfterMs
      ? "stale"
      : isRefreshing
        ? "syncing"
        : "live"

  return {
    state,
    ageMs,
    now,
    canWrite: state === "live" || state === "syncing",
    refresh
  }
}
