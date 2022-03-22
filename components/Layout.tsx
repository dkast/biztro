import { Fragment, useState } from "react"
import { Dialog, Menu, Transition } from "@headlessui/react"
import {
  CogIcon,
  HomeIcon,
  MenuAlt2Icon,
  ViewGridIcon,
  XIcon
} from "@heroicons/react/outline"
import { SearchIcon } from "@heroicons/react/solid"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { signOut, useSession } from "next-auth/react"

import classNames from "@/lib/classnames"

type LayoutProps = {
  children: React.ReactNode
}

const sidebarNavigation = [
  { name: "Inicio", href: "/dashboard", icon: HomeIcon },
  { name: "Menu", href: "/menu-editor", icon: ViewGridIcon },
  { name: "Ajustes", href: "/settings", icon: CogIcon }
]
const userNavigation = [
  { name: "Tu Perfil", href: "/profile" },
  { name: "Salir", href: "/sign-out" }
]

const Layout = ({ children }: LayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { asPath } = useRouter()
  const { data: session, status } = useSession()

  if (status === "loading") {
    return null
  }

  return (
    <>
      <div className="flex h-screen">
        {/* Narrow sidebar */}
        <div className="hidden w-16 overflow-y-auto border-r border-gray-200 bg-white md:block">
          <div className="flex w-full flex-col items-center py-6">
            <div className="flex flex-shrink-0 items-center">
              <Image
                className="h-8 w-auto"
                src="/icon.svg"
                alt="Bistro"
                width={32}
                height={32}
              />
            </div>
            <div className="mt-6 w-full flex-1 space-y-1 px-2">
              {sidebarNavigation.map(item => (
                <Link key={item.name} href={item.href}>
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      item.href === asPath
                        ? "bg-gray-200 text-gray-700"
                        : "text-gray-500 hover:bg-zinc-800 hover:text-white",
                      "group flex w-full flex-col items-center rounded-xl p-3 text-xs font-medium"
                    )}
                    aria-current={item.href === asPath ? "page" : undefined}
                  >
                    <item.icon
                      className={classNames(
                        item.href === asPath
                          ? "text-gray-700"
                          : "text-gray-400 group-hover:text-white",
                        "h-6 w-6"
                      )}
                      aria-hidden="true"
                    />
                    {/* <span className="mt-2">{item.name}</span> */}
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <Transition.Root show={mobileMenuOpen} as={Fragment}>
          <Dialog as="div" className="md:hidden" onClose={setMobileMenuOpen}>
            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition-opacity ease-linear duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity ease-linear duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
              </Transition.Child>
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <div className="relative flex w-full max-w-xs flex-1 flex-col bg-indigo-700 pt-5 pb-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-1 right-0 -mr-14 p-1">
                      <button
                        type="button"
                        className="flex h-12 w-12 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <XIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                        <span className="sr-only">Close sidebar</span>
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex flex-shrink-0 items-center px-4">
                    <Image
                      className="h-8 w-auto"
                      src="/icon.svg"
                      alt="Bistro"
                      width={32}
                      height={32}
                    />
                  </div>
                  <div className="mt-5 h-0 flex-1 overflow-y-auto px-2">
                    <nav className="flex h-full flex-col">
                      <div className="space-y-1">
                        {sidebarNavigation.map(item => (
                          <Link key={item.name} href={item.href}>
                            <a
                              key={item.name}
                              href={item.href}
                              className={classNames(
                                item.href === asPath
                                  ? "bg-indigo-800 text-white"
                                  : "text-indigo-100 hover:bg-indigo-800 hover:text-white",
                                "group flex items-center rounded-md py-2 px-3 text-sm font-medium"
                              )}
                              aria-current={
                                item.href === asPath ? "page" : undefined
                              }
                            >
                              <item.icon
                                className={classNames(
                                  item.href === asPath
                                    ? "text-white"
                                    : "text-indigo-300 group-hover:text-white",
                                  "mr-3 h-6 w-6"
                                )}
                                aria-hidden="true"
                              />
                              <span>{item.name}</span>
                            </a>
                          </Link>
                        ))}
                      </div>
                    </nav>
                  </div>
                </div>
              </Transition.Child>
              <div className="w-14 flex-shrink-0" aria-hidden="true">
                {/* Dummy element to force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="w-full">
            <div className="relative z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white">
              <button
                type="button"
                className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <MenuAlt2Icon className="h-6 w-6" aria-hidden="true" />
              </button>
              <div className="flex flex-1 justify-between px-4 sm:px-6">
                <div className="flex flex-1">
                  {/* <form className="flex w-full md:ml-0" action="#" method="GET">
                    <label htmlFor="search-field" className="sr-only">
                      Search all files
                    </label>
                    <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                        <SearchIcon
                          className="h-5 w-5 flex-shrink-0"
                          aria-hidden="true"
                        />
                      </div>
                      <input
                        name="search-field"
                        id="search-field"
                        className="h-full w-full border-transparent py-2 pl-8 pr-3 text-base text-gray-900 placeholder-gray-500 focus:border-transparent focus:placeholder-gray-400 focus:outline-none focus:ring-0"
                        placeholder="Search"
                        type="search"
                      />
                    </div>
                  </form> */}
                </div>
                <div className="ml-2 flex items-center space-x-4 sm:ml-6 sm:space-x-6">
                  {/* Profile dropdown */}
                  <Menu as="div" className="relative flex-shrink-0">
                    <div>
                      <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        <span className="sr-only">Abre menu del suario</span>
                        {session.user?.image ? (
                          <Image
                            className="inline-block h-8 w-8 rounded-full"
                            src={session.user?.image}
                            alt="Avatar"
                            referrerPolicy="no-referrer"
                            width={32}
                            height={32}
                          />
                        ) : (
                          <span className="inline-block h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                            <svg
                              className="h-full w-full text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </span>
                        )}
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {userNavigation.map(item => {
                          if (item.href === "/sign-out") {
                            return (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <a
                                    className={classNames(
                                      active ? "bg-gray-100" : "",
                                      "block cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    )}
                                    onClick={e => {
                                      e.preventDefault
                                      signOut()
                                    }}
                                  >
                                    {item.name}
                                  </a>
                                )}
                              </Menu.Item>
                            )
                          } else {
                            return (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <Link key={item.name} href={item.href}>
                                    <a
                                      href={item.href}
                                      className={classNames(
                                        active ? "bg-gray-100" : "",
                                        "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      )}
                                    >
                                      {item.name}
                                    </a>
                                  </Link>
                                )}
                              </Menu.Item>
                            )
                          }
                        })}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <div className="flex flex-1 items-stretch overflow-hidden">
            <main className="flex-1 overflow-y-auto">
              {/* Primary column */}
              <section
                aria-labelledby="primary-heading"
                className="flex h-full min-w-0 flex-1 flex-col lg:order-last"
              >
                <h1 id="primary-heading">Photos</h1>
                {/* Your content */}
              </section>
            </main>

            {/* Secondary column (hidden on smaller screens) */}
            {/* <aside className="hidden w-96 overflow-y-auto border-l border-gray-200 bg-white lg:block"> */}
            {/* Your content */}
            {/* </aside> */}
          </div>
        </div>
      </div>
    </>
  )
}

export default Layout
