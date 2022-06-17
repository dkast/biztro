import Head from "next/head"
import { useSession } from "next-auth/react"

import Layout from "@/components/layouts/Layout"
import PageHeader from "@/components/PageHeader"
import { NextPageWithAuthAndLayout } from "@/lib/types"
import Onboarding from "@/components/Onboarding"

const Dashboard: NextPageWithAuthAndLayout = () => {
  const { data: session } = useSession()
  const firstName = session?.user?.name.split(" ")[0]

  return (
    <>
      <Head>
        <title>Biztro - Inicio</title>
      </Head>
      <div className="py-6">
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          <PageHeader title={`Empecemos, ${firstName}`}></PageHeader>
        </div>
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          {/* Replace with your content */}
          <div className="py-4">
            <Onboarding />
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
