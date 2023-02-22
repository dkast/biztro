import type { Item, Site } from "@prisma/client"
import useSWR from "swr"

import fetcher from "@/lib/fetcher"

interface SiteItemData {
  items: Array<Item>
  site: Site | null
}

export default function useItems(siteId) {
  const { data, error } = useSWR<SiteItemData>(
    siteId && `/api/item?siteId=${siteId}`,
    fetcher
  )

  return {
    data,
    isLoading: !error && !data,
    isError: error
  }
}
