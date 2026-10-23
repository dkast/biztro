"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition
} from "react"
import * as Sentry from "@sentry/nextjs"
import { createRealtime } from "@upstash/realtime/client"
import { useRouter } from "next/navigation"

import {
  createOrderRefreshQueue,
  getOrderLiveState
} from "@/lib/order-refresh-queue"
import {
  getOrdersChannel,
  type orderRealtimeSchema
} from "@/lib/types/order-realtime"

export type { LiveConnectionState } from "@/lib/types/order-realtime"

const { useRealtime } = createRealtime<typeof orderRealtimeSchema>()

export function useLiveRefresh(serverTime: string, organizationId: string) {
  const router = useRouter()
  const [isRefreshing, startRefresh] = useTransition()
  const [isOnline, setIsOnline] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [isRestarting, setIsRestarting] = useState(false)
  const [isQueued, setIsQueued] = useState(false)
  const [isReconciled, setIsReconciled] = useState(false)
  const [hasRefreshError, setHasRefreshError] = useState(false)
  const [hasConnectionError, setHasConnectionError] = useState(false)
  const [now, setNow] = useState(() => Date.parse(serverTime))
  const [syncedAt, setSyncedAt] = useState(() => Date.parse(serverTime))
  const snapshotRef = useRef(serverTime)
  const requestedSnapshotRef = useRef(serverTime)
  const wasRefreshingRef = useRef(false)

  const queue = useMemo(
    () =>
      createOrderRefreshQueue(() => {
        requestedSnapshotRef.current = snapshotRef.current
        setHasRefreshError(false)
        startRefresh(() => router.refresh())
      }, setIsQueued),
    [router]
  )

  const enabled = isOnline && isVisible && !isRestarting
  const { status } = useRealtime({
    channels: [getOrdersChannel(organizationId)],
    events: ["orders.changed", "orders.connected"],
    enabled,
    onData: ({ event }) => {
      if (event === "orders.connected") setIsReconciled(false)
      queue.request()
    }
  })
  const isConnected = enabled && status === "connected"

  useEffect(() => {
    setHasConnectionError(false)
    if (!enabled || isConnected) return

    const timeout = window.setTimeout(() => {
      setHasConnectionError(true)
      Sentry.captureMessage("Order realtime connection timed out", {
        level: "warning",
        tags: { section: "orders-realtime", operation: "subscribe" }
      })
    }, 15_000)
    return () => window.clearTimeout(timeout)
  }, [enabled, isConnected])

  useEffect(() => {
    snapshotRef.current = serverTime
    const receivedAt = Date.now()
    setSyncedAt(receivedAt)
    setNow(receivedAt)
  }, [serverTime])

  useEffect(() => {
    if (wasRefreshingRef.current && !isRefreshing) {
      const receivedSnapshot =
        snapshotRef.current !== requestedSnapshotRef.current
      const hasMore = queue.complete()
      setHasRefreshError(!receivedSnapshot)
      setIsReconciled(
        wasReconciled => receivedSnapshot && (wasReconciled || !hasMore)
      )
      if (!receivedSnapshot) {
        Sentry.captureMessage(
          "Order refresh completed without a new snapshot",
          {
            level: "warning",
            tags: { section: "orders-realtime", operation: "refresh" }
          }
        )
      }
    }
    wasRefreshingRef.current = isRefreshing
  }, [isRefreshing, queue])

  useEffect(() => {
    setIsReconciled(false)
    if (enabled && status === "connected") queue.request()
    else queue.pause()

    if (status === "error") {
      Sentry.captureMessage("Order realtime connection unavailable", {
        level: "warning",
        tags: { section: "orders-realtime", operation: "subscribe" }
      })
    }
  }, [enabled, status, organizationId, queue])

  useEffect(() => () => queue.pause(), [queue])

  useEffect(() => {
    if (!isRefreshing) return

    const timeout = window.setTimeout(() => {
      setHasRefreshError(true)
      setIsReconciled(false)
      Sentry.captureMessage("Order snapshot refresh timed out", {
        level: "warning",
        tags: { section: "orders-realtime", operation: "refresh" }
      })
    }, 15_000)
    return () => window.clearTimeout(timeout)
  }, [isRefreshing])

  useEffect(() => {
    if (!isRestarting) return

    // Unregister for one commit to reset an exhausted SDK connection in place.
    const timeout = window.setTimeout(() => setIsRestarting(false), 0)
    return () => window.clearTimeout(timeout)
  }, [isRestarting])

  const refresh = useCallback(() => {
    if (!navigator.onLine || document.visibilityState !== "visible") return
    if (status !== "connected" || hasConnectionError || hasRefreshError) {
      setIsReconciled(false)
      setIsRestarting(true)
    } else queue.request()
  }, [status, hasConnectionError, hasRefreshError, queue])

  useEffect(() => {
    const updateActivity = () => {
      setIsOnline(navigator.onLine)
      setIsVisible(document.visibilityState === "visible")
      setNow(Date.now())
    }
    const handleFocus = () => {
      updateActivity()
      refresh()
    }
    updateActivity()

    // Only advances elapsed labels. Network refreshes are event-driven.
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") setNow(Date.now())
    }, 15_000)
    window.addEventListener("online", updateActivity)
    window.addEventListener("offline", updateActivity)
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", updateActivity)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener("online", updateActivity)
      window.removeEventListener("offline", updateActivity)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", updateActivity)
    }
  }, [refresh])

  const connection = getOrderLiveState({
    isOnline,
    enabled,
    status,
    isReconciled,
    isPending: isRefreshing || isQueued,
    hasError: hasRefreshError || hasConnectionError
  })

  return {
    ...connection,
    ageMs: Math.max(0, now - syncedAt),
    now,
    refresh
  }
}
