import Head from "next/head"

import Layout from "@/components/Layout"
import { NextPageWithAuthAndLayout } from "@/lib/types"

const Dashboard: NextPageWithAuthAndLayout = () => {
  return (
    <>
      <Head>Bistro - Inicio</Head>
      <div className="py-6">
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          <h1
            id="primary-heading"
            className="text-2xl font-semibold text-gray-900"
          >
            Inicio
          </h1>
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
