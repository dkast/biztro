"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function MenuEditorError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="flex max-w-lg flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
          Ocurrió un error en el editor
        </h1>
        <p className="text-sm text-gray-500">
          Intenta nuevamente o vuelve al dashboard para seleccionar otro menú.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset}>Reintentar</Button>
          <Link href="/dashboard">
            <Button variant="outline">Volver al dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
