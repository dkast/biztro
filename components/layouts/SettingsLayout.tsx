import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"

import PageHeader from "@/components/PageHeader"

import classNames from "@/lib/classnames"

type LayoutProps = {
  children: React.ReactNode
}

const tabs = [
  { name: "Información Básica", href: "/app/settings" },
  { name: "Perfil", href: "/app/settings/profile" }
]

const SettingsLayout = ({ children }: LayoutProps) => {
  const { asPath } = useRouter()
  return <>
    <Head>
      <title>Biztro - Ajustes</title>
    </Head>
    <div className="py-6">
      <div className="mx-auto px-4 sm:px-6 md:px-8">
        <PageHeader title={"Ajustes"}></PageHeader>
      </div>
      <div className="mx-auto px-4 py-4 sm:px-6 md:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map(tab => (
              (<Link
                key={tab.name}
                href={tab.href}
                className={classNames(
                  tab.href === asPath
                    ? "border-zinc-700 text-zinc-800"
                    : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700",
                  "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
                )}
                aria-current={tab.href === asPath ? "page" : undefined}>

                {tab.name}

              </Link>)
            ))}
          </nav>
        </div>
        <div className="mx-auto max-w-7xl py-4">{children}</div>
      </div>
    </div>
  </>;
}

export default SettingsLayout
