"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

export default function RevalidateStatus() {
  const queryClient = useQueryClient()
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    let mounted = true

    async function run() {
      try {
        if (!mounted) return
        setIsRunning(true)
        await queryClient.invalidateQueries({
          queryKey: ["workgroup", "current"]
        })
      } finally {
        // Avoid using returns inside finally blocks — only update state if still mounted
        if (mounted) {
          setIsRunning(false)
        }
      }
    }

    void run()

    return () => {
      mounted = false
    }
    // We intentionally only want to run this once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isRunning) return null

  return (
    <div className="my-2 flex items-center gap-2 text-gray-500">
      <Loader2 className="size-4 animate-spin" />
      <span className="text-sm">Revalidando estado</span>
    </div>
  )
}
