"use client"

import React from "react"
import { Toaster } from "react-hot-toast"
// import { PhotoProvider } from "react-photo-view"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental"
import { Provider } from "jotai"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { usePathname } from "next/navigation"

// import { AppProgressBar as ProgressBar } from "next-nprogress-bar"

import { UnsavedChangesProvider } from "@/components/dashboard/unsaved-changes-provider"
import { TailwindIndicator } from "@/components/tailwind-indicator"

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
    return "light"
  }
  if (pathname === "/terms") {
    return "light"
  }
  if (pathname === "/privacy") {
    return "light"
  }
  if (pathname?.startsWith("/blog")) {
    return "light"
  }
  return undefined
}

function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  const forcedTheme = getForcedTheme(usePathname())

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        forcedTheme={forcedTheme}
      >
        <QueryClientProvider client={queryClient}>
          <Provider>
            {/* <PhotoProvider> */}
            {/* <Suspense fallback={null}>
            <ProgressBar
              color="#FF6500"
              options={{ showSpinner: false }}
              shallowRouting
              delay={200}
            />
          </Suspense> */}
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
            {/* </PhotoProvider> */}
          </Provider>
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}

export default Providers
