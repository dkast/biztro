import Head from "next/head"
import Image from "next/image"
import Link from "next/link"

import type { NextPageWithAuthAndLayout } from "@/lib/types"

const Home: NextPageWithAuthAndLayout = () => {
  return (
    <>
      <Head>
        <title>Bistro</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen flex-col items-center justify-center">
        <Image src="/logo-bistro.svg" alt="Logo" width={200} height={200} />
        <span className="my-6 text-4xl font-bold sm:text-6xl">
          {"Próximamente"}
        </span>
        <Link href="/app/dashboard">Entrar</Link>
      </div>
    </>
  )
}

Home.auth = false

export default Home
