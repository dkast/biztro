import Link from "next/link"
import Head from "next/head"
import { useRouter } from "next/router"

import PageHeader from "@/components/PageHeader"
import classNames from "@/lib/classnames"

type LayoutProps = {
  children: React.ReactNode
}

const tabs = [
  { name: "Informacion Básica", href: "/settings/general" },
  { name: "Perfil", href: "/settings/profile" }
]

const SettingsLayout = ({ children }: LayoutProps) => {
  const { asPath } = useRouter()
  return (
    <>
      <Head>
        <title>Bistro - Ajustes</title>
      </Head>
      <div className="py-6">
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          <PageHeader title={"Ajustes"}></PageHeader>
        </div>
        <div className="mx-auto px-4 py-4 sm:px-6 md:px-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map(tab => (
                <Link key={tab.name} href={tab.href}>
                  <a
                    key={tab.name}
                    href={tab.href}
                    className={classNames(
                      tab.href === asPath
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                      "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
                    )}
                    aria-current={tab.href === asPath ? "page" : undefined}
                  >
                    {tab.name}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          <div className="mx-auto max-w-7xl py-4">{children}</div>
        </div>
      </div>
    </>
  )
}

export default SettingsLayout
