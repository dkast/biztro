"use client"

import React from "react"
import { Toaster } from "react-hot-toast"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental"
import { Provider } from "jotai"
import { ThemeProvider } from "next-themes"
import { usePathname } from "next/navigation"
import { NuqsAdapter } from "nuqs/adapters/next/app"

import { UnsavedChangesProvider } from "@/components/dashboard/unsaved-changes-provider"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { CSPostHogProvider } from "@/app/analytics"

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000
      }
    }
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important so we don't re-make a new client if React
    // supsends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

const getForcedTheme = (pathname: string | null) => {
  if (pathname === "/") {
    return "dark"
  }
  return undefined
}

function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  const forcedTheme = getForcedTheme(usePathname())

  return (
    <CSPostHogProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        forcedTheme={forcedTheme}
      >
        <NuqsAdapter>
          <QueryClientProvider client={queryClient}>
            <Provider>
              <UnsavedChangesProvider>
                <ReactQueryStreamedHydration>
                  {children}
                </ReactQueryStreamedHydration>
              </UnsavedChangesProvider>
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    background: "#333",
                    color: "#fff"
                  }
                }}
              />
              <TailwindIndicator />
            </Provider>
          </QueryClientProvider>
        </NuqsAdapter>
      </ThemeProvider>
    </CSPostHogProvider>
  )
}

export default Providers
