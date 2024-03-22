import React from "react"
import { Toaster } from "react-hot-toast"
import { SessionProvider, signIn, useSession } from "next-auth/react"
import { DefaultSeo } from "next-seo"
import { type AppProps } from "next/app"
import Head from "next/head"
import { RecoilRoot } from "recoil"

import "../styles/globals.css"

// import SEO from "next-seo-config"

import ConfirmModal from "@/components/ConfirmModal"
import BlogLayout from "@/components/layouts/BlogLayout"
import type { NextPageWithAuthAndLayout } from "@/lib/types"

type AppPropsWithAuthAndLayout = AppProps & {
  Component: NextPageWithAuthAndLayout
}

// export { reportWebVitals } from "next-axiom"

function MyApp({
  Component,
  pageProps: { session, ...pageProps }
}: AppPropsWithAuthAndLayout) {
  const getLayout = Component.getLayout ?? (page => page)

  return (
    <SessionProvider session={session}>
      <RecoilRoot>
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, viewport-fit=cover"
          />
        </Head>
        {/* <DefaultSeo {...SEO} /> */}
        {Component.auth ? (
          <Auth>{getLayout(<Component {...pageProps} />)}</Auth>
        ) : "markdoc" in pageProps ? (
          <BlogLayout>
            <Component {...pageProps} />
          </BlogLayout>
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
        <ConfirmModal />
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
