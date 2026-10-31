import * as Sentry from "@sentry/nextjs"
import { handle, isRealtimeCursor } from "@upstash/realtime"
import { unstable_rethrow } from "next/navigation"

import { realtime } from "@/server/orders/realtime"
import { auth } from "@/lib/auth"
import { getOrdersChannel } from "@/lib/types/order-realtime"

export const maxDuration = 300

const responseHeaders = { "Cache-Control": "private, no-store" }

const streamHandler = handle({
  realtime,
  middleware: async ({ request, channels }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) {
      return Response.json(
        { error: "Inicia sesión para recibir las órdenes." },
        { status: 401, headers: responseHeaders }
      )
    }

    const member = await auth.api.getActiveMember({ headers: request.headers })
    if (
      !member?.organizationId ||
      channels.length !== 1 ||
      channels[0] !== getOrdersChannel(member.organizationId)
    ) {
      return Response.json(
        { error: "No tienes acceso a esta cola de órdenes." },
        { status: 403, headers: responseHeaders }
      )
    }
  }
})

export async function GET(request: Request) {
  try {
    const response = await streamHandler(request)
    if (!response) throw new Error("Realtime handler returned no response")

    response.headers.set("Cache-Control", "private, no-store")
    response.headers.delete("Access-Control-Allow-Origin")
    response.headers.delete("Access-Control-Allow-Headers")
    if (!response.ok || !response.body) return response
    const searchParams = new URL(request.url).searchParams

    // The SDK reports subscriber failures in-band without closing the stream.
    // Turn them into a disconnect so the client cannot remain falsely "live".
    const body = response.body.pipeThrough(
      new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
          try {
            const event: unknown = JSON.parse(
              new TextDecoder().decode(chunk).slice("data: ".length)
            )
            if (
              typeof event === "object" &&
              event !== null &&
              "type" in event &&
              event.type === "error"
            ) {
              throw new Error("Realtime Redis subscription failed")
            }
            controller.enqueue(chunk)
            if (
              typeof event === "object" &&
              event !== null &&
              "type" in event &&
              event.type === "connected" &&
              "channel" in event &&
              typeof event.channel === "string"
            ) {
              const ack = searchParams.get(`last_ack_${event.channel}`) ?? "0-0"
              const id = isRealtimeCursor(ack)
                ? ack
                : isRealtimeCursor(`${ack}-0`)
                  ? `${ack}-0`
                  : "0-0"
              // Native EventSource reconnects need not change the SDK status.
              // Request recovery on every subscription without advancing its ack.
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({
                    id,
                    event: "orders.connected",
                    channel: event.channel,
                    data: {}
                  })}\n\n`
                )
              )
            }
          } catch (error) {
            Sentry.captureException(error, {
              tags: { section: "orders-realtime", operation: "stream" }
            })
            throw error
          }
        }
      })
    )

    return new Response(body, { headers: response.headers })
  } catch (error) {
    unstable_rethrow(error)
    console.error("Failed to open order stream", error)
    Sentry.captureException(error, {
      tags: { section: "orders-realtime", operation: "connect" }
    })
    return Response.json(
      { error: "No se pudo conectar con las órdenes. Intenta de nuevo." },
      { status: 500, headers: responseHeaders }
    )
  }
}
