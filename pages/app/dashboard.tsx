import Head from "next/head"

import Layout from "@/components/layouts/Layout"
import PageHeader from "@/components/PageHeader"
import { NextPageWithAuthAndLayout } from "@/lib/types"

const Dashboard: NextPageWithAuthAndLayout = () => {
  return (
    <>
      <Head>
        <title>Bistro - Inicio</title>
      </Head>
      <div className="py-6">
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          <PageHeader title={"Inicio"}></PageHeader>
        </div>
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          {/* Replace with your content */}
          <div className="py-4">
            <div className="h-96 rounded-lg border-4 border-dashed border-gray-200" />
          </div>
          {/* /End replace */}
        </div>
      </div>
    </>
  )
}

Dashboard.auth = true
Dashboard.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>
}

export default Dashboard
