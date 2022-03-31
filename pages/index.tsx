import Head from "next/head"
import Image from "next/image"

import type { NextPageWithAuthAndLayout } from "@/lib/types"
import Link from "next/link"

const Home: NextPageWithAuthAndLayout = () => {
  return (
    <>
      <Head>
        <title>Bistro</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen flex-col items-center justify-center">
        <Image src="/icon.svg" alt="Logo" width={200} height={200} />
        <span className="my-6 text-6xl font-bold">{"Próximamente"}</span>
        <Link href="/app/dashboard">Entrar</Link>
      </div>
    </>
  )
}

Home.auth = false

export default Home
