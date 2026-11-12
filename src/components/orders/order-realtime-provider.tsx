"use client"

import { RealtimeProvider } from "@upstash/realtime/client"

export function OrderRealtimeProvider({
  children
}: {
  children: React.ReactNode
}) {
  return <RealtimeProvider>{children}</RealtimeProvider>
}
