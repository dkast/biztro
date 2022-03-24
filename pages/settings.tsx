import Head from "next/head"

import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"
import { NextPageWithAuthAndLayout } from "@/lib/types"

const Settings: NextPageWithAuthAndLayout = () => {
  return (
    <>
      <Head>Bistro - Ajustes</Head>
      <div className="py-6">
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          <PageHeader title={"Ajustes"}></PageHeader>
        </div>
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="h-96 rounded-lg border-4 border-dashed border-gray-200" />
          </div>
        </div>
      </div>
    </>
  )
}

Settings.auth = true
Settings.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>
}

export default Settings
