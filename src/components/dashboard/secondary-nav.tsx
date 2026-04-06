"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname, useSelectedLayoutSegment } from "next/navigation"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export type SecondaryNavItem = {
  href: string
  title: string
  icon?: ReactNode
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: SecondaryNavItem[]
}

export default function SecondaryNav({
  className,
  items,
  ...props
}: SidebarNavProps) {
  const pathname = usePathname()
  const segment = useSelectedLayoutSegment()

  return (
    <div className="max-w-[100vw]">
      <ScrollArea className="whitespace-nowrap">
        <nav className={cn("w-full overflow-hidden", className)} {...props}>
          <ul className="flex gap-x-8 px-4 sm:px-6">
            {items.map(item => {
              const path = `/${item.href}`
              let isActive = false
              if (!segment) {
                isActive = pathname?.includes(item.href) ?? false
              } else {
                isActive = item.href.includes(segment)
              }

              return (
                <li key={item.href} className="flex-none">
                  <Link
                    href={path}
                    prefetch={false}
                    className={cn(
                      `relative flex items-center gap-2 border-b-2
                      border-transparent py-4 text-sm font-semibold
                      text-taupe-500 transition-colors hover:text-taupe-100`,
                      isActive && "border-white text-taupe-50"
                    )}
                  >
                    {item.icon ? (
                      <span className="shrink-0">{item.icon}</span>
                    ) : null}
                    {item.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <Separator className="mb-4" />
    </div>
  )
}
