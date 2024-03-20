"use client"

import { motion } from "framer-motion"
import {
  LayoutList,
  LayoutTemplate,
  Settings,
  type LucideIcon
} from "lucide-react"
import Link from "next/link"
import { usePathname, useSelectedLayoutSegment } from "next/navigation"

import Workgroup from "@/components/dashboard/workgroup"
import { cn } from "@/lib/utils"

type NavigationItem = {
  name: string
  href: string
  icon: LucideIcon
}

const navigation: NavigationItem[] = [
  { name: "Menú", href: "dashboard", icon: LayoutTemplate },
  {
    name: "Productos",
    href: "dashboard/items",
    icon: LayoutList
  },
  {
    name: "Configuración",
    href: "dashboard/settings",
    icon: Settings
  }
]

export default function Sidebar() {
  return (
    <>
      {/* Sidebar for desktop */}
      <div className="hidden transition-all duration-300 ease-in-out lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-60 lg:flex-col">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pt-20 dark:border-gray-800 dark:bg-gray-900/50">
          {/* <div className="justify-betweenflex h-16 shrink-0 items-center">
            <Workgroup className={cn(isSidebarOpen ? "visible" : "hidden")} />
          </div> */}
          <div className="flex h-16 shrink-0 items-center justify-between">
            <Workgroup />
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-2">
                  {navigation.map(item => (
                    <NavigationLink item={item} key={item.name} />
                  ))}
                </ul>
              </li>
              <li className="-mx-6 mt-auto">{/* <ProfileMenu /> */}</li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}

function NavigationLink({ item }: { item: NavigationItem }) {
  const pathname = usePathname()
  const segment = useSelectedLayoutSegment()

  let isActive = false
  if (!segment || segment === "(start)") {
    isActive = pathname?.includes(item.href) ?? false
  } else {
    isActive = item.href.includes(segment)
  }

  const path = `/${item.href}`

  return (
    <motion.li
      key={item.name}
      className="flex flex-row items-center gap-1"
      whileTap={{ scale: 0.95 }}
    >
      <div
        className={cn(
          isActive ? "bg-orange-500" : "bg-transparent",
          "h-6 w-1 rounded-full"
        )}
        aria-hidden="true"
      />
      <Link
        href={path}
        className={cn(
          isActive
            ? "bg-gray-100/70 text-gray-700 dark:bg-gray-800/70 dark:text-gray-300"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-600",
          "group flex grow gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
        )}
      >
        <item.icon
          className={cn(
            isActive
              ? "text-gray-800 dark:text-gray-300"
              : "text-gray-400 group-hover:text-gray-600 dark:text-gray-700",
            "h-6 w-6 shrink-0"
          )}
          aria-hidden="true"
        />
        <span className="animate-in animate-out fade-in fade-out">
          {item.name}
        </span>
      </Link>
    </motion.li>
  )
}
