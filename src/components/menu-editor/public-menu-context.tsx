"use client"

import * as React from "react"

import type { PublicMenuSearchItem } from "@/lib/menu-search"

type PublicMenuContextValue = {
  items: PublicMenuSearchItem[]
}

const PublicMenuContext = React.createContext<PublicMenuContextValue | null>(
  null
)

export function PublicMenuProvider({
  children,
  items
}: {
  children: React.ReactNode
  items: PublicMenuSearchItem[]
}) {
  return (
    <PublicMenuContext.Provider value={{ items }}>
      {children}
    </PublicMenuContext.Provider>
  )
}

export function usePublicMenu() {
  return React.useContext(PublicMenuContext)
}
