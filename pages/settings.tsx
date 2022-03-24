import Head from "next/head"
import * as Tabs from "@radix-ui/react-tabs"

import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"
import { NextPageWithAuthAndLayout } from "@/lib/types"

const Settings: NextPageWithAuthAndLayout = () => {
  return (
    <>
      <Head>
        <title>Bistro - Ajustes</title>
      </Head>
      <div className="py-6">
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          <PageHeader title={"Ajustes"}></PageHeader>
        </div>
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <Tabs.Root defaultValue="personal">
              <Tabs.List
                aria-label="Pestaña Ajustes"
                className="flex space-x-8 border-b border-gray-200"
              >
                <Tabs.Trigger
                  value="personal"
                  className="whitespace-nowrap border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 radix-state-active:border-indigo-500 radix-state-active:text-indigo-500"
                >
                  Personal
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="site"
                  className="whitespace-nowrap border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 radix-state-active:border-indigo-500 radix-state-active:text-indigo-500"
                >
                  Negocio
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="personal">Personal</Tabs.Content>
              <Tabs.Content value="site">Negocio</Tabs.Content>
            </Tabs.Root>
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
