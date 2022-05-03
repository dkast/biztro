import React from "react"
import { SessionProvider, useSession, signIn } from "next-auth/react"
import { AppProps } from "next/app"
import { Toaster } from "react-hot-toast"
import { RecoilRoot } from "recoil"

import "../styles/globals.css"

import type { NextPageWithAuthAndLayout } from "@/lib/types"

type AppPropsWithAuthAndLayout = AppProps & {
  Component: NextPageWithAuthAndLayout
}

function MyApp({
  Component,
  pageProps: { session, ...pageProps }
}: AppPropsWithAuthAndLayout) {
  const getLayout = Component.getLayout ?? (page => page)

  return (
    <SessionProvider session={session}>
      <RecoilRoot>
        {Component.auth ? (
          <Auth>{getLayout(<Component {...pageProps} />)}</Auth>
        ) : (
          getLayout(<Component {...pageProps} />)
        )}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff"
            }
          }}
        />
      </RecoilRoot>
    </SessionProvider>
  )
}

function Auth({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  const isUser = !!session?.user
  React.useEffect(() => {
    if (status === "loading") return // Do nothing while loading
    if (!isUser) signIn() // If not authenticated, force log ing
  }, [isUser, status])

  if (isUser) {
    return <>{children}</>
  }

  // Session is being fetched or no user. If no user, useEffect() will redirect
  return null
}

export default MyApp
