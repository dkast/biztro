import React, { useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Image from "next/image"

import type { NextPageWithAuthAndLayout } from "@/lib/types"

const Home: NextPageWithAuthAndLayout = () => {
  // const user = useUser<User>();
  const router = useRouter()

  // useEffect(() => {
  //   if (user) {
  //     router.push("/dashboard");
  //   }
  // }, [user]);

  return (
    <>
      <Head>
        <title>Bistro</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col items-center justify-center h-screen">
        <Image src="/icon.svg" alt="Logo" width={200} height={200} />
        <span className="font-bold text-6xl my-6">{"Próximamente"}</span>
        <a href="/dashboard">{"Entrar"}</a>
      </div>
    </>
  )
}

Home.auth = false

export default Home
