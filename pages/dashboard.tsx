import Head from "next/head"

import Layout from "@/components/Layout"
import { NextPageWithAuthAndLayout } from "@/lib/types"

const Dashboard: NextPageWithAuthAndLayout = () => {
  return (
    <>
      <Head>Bistro - Inicio</Head>
      <h1>Dashboard</h1>
    </>
  )
}

Dashboard.auth = true
Dashboard.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>
}

export default Dashboard
