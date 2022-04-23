import useSWR from "swr"

import fetcher from "@/lib/fetcher"

import type { Item, Site } from "@prisma/client"

interface SiteItemData {
  items: Array<Item>
  site: Site | null
}

export default function useItem(itemId) {
  const { data, error } = useSWR<SiteItemData>(
    itemId && `/api/item?itemId=${itemId}`,
    fetcher
  )

  return {
    data: data.items[0],
    isLoading: !error && !data,
    isError: error
  }
}
