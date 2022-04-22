import useSWR from "swr"

import fetcher from "@/lib/fetcher"

import type { Site } from "@prisma/client"

export default function useSite(sessionId) {
  const { data, error } = useSWR<Site>(sessionId && "/api/site", fetcher)

  return {
    site: data,
    isLoading: !error && !data,
    isError: error
  }
}