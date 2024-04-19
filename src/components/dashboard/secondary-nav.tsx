"use client"

import Link from "next/link"
import { usePathname, useSelectedLayoutSegment } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
  }[]
}

export default function SecondaryNav({
  className,
  items,
  ...props
}: SidebarNavProps) {
  const pathname = usePathname()
  const segment = useSelectedLayoutSegment()

  return (
    <>
      <nav className={cn("flex overflow-x-auto", className)} {...props}>
        <ul className="flex min-w-full flex-none gap-x-6 px-4">
          {items.map(item => {
            const path = `/${item.href}`
            let isActive = false
            if (!segment) {
              isActive = pathname?.includes(item.href) ?? false
            } else {
              isActive = item.href.includes(segment)
            }

            return (
              <li key={item.href}>
                <Link
                  href={path}
                  className={cn(
                    "my-1 block rounded-lg px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                    isActive && "text-orange-600"
                  )}
                >
                  {item.title}
                </Link>
                {/* <div
                  className={cn(
                    "h-0.5 rounded-full",
                    isActive && "bg-orange-500"
                  )}
                /> */}
              </li>
            )
          })}
        </ul>
      </nav>
      <Separator className="mb-4" />
    </>
  )
}
