import type { useRealtime } from "@upstash/realtime/client"

import type { LiveConnectionState } from "@/lib/types/order-realtime"

const refreshDebounceMs = 150

export function getOrderLiveState({
  isOnline,
  enabled,
  status,
  isReconciled,
  isPending,
  hasError
}: {
  isOnline: boolean
  enabled: boolean
  status: ReturnType<typeof useRealtime>["status"]
  isReconciled: boolean
  isPending: boolean
  hasError: boolean
}) {
  const state: LiveConnectionState = !isOnline
    ? "offline"
    : hasError || status === "error"
      ? "stale"
      : !enabled || status !== "connected"
        ? "connecting"
        : !isReconciled || isPending
          ? "syncing"
          : "live"

  return {
    state,
    canWrite:
      enabled && status === "connected" && isReconciled && !hasError && isOnline
  }
}

export function createOrderRefreshQueue(
  onRefresh: () => void,
  onPending: (pending: boolean) => void
) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let isRefreshing = false
  let isDirty = false

  function schedule() {
    if (timer !== undefined || isRefreshing || !isDirty) return

    timer = setTimeout(() => {
      timer = undefined
      isDirty = false
      isRefreshing = true
      onRefresh()
    }, refreshDebounceMs)
  }

  return {
    request() {
      isDirty = true
      onPending(true)
      schedule()
    },
    complete() {
      isRefreshing = false
      onPending(isDirty)
      schedule()
      return isDirty
    },
    pause() {
      if (timer !== undefined) clearTimeout(timer)
      timer = undefined
      isDirty = false
    }
  }
}
