"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
  const activePath = items.reduce<string | null>((currentPath, item) => {
    const path = `/${item.href}`
    const matchesPath = pathname === path || pathname?.startsWith(`${path}/`)

    if (!matchesPath || (currentPath && currentPath.length >= path.length)) {
      return currentPath
    }

    return path
  }, null)

  return (
    <div className="max-w-[100vw]">
      <ScrollArea className="whitespace-nowrap">
        <nav className={cn("w-full overflow-hidden", className)} {...props}>
          <ul className="flex gap-x-8 px-4 sm:px-6">
            {items.map(item => {
              const path = `/${item.href}`
              const isActive = path === activePath

              return (
                <li key={item.href} className="flex-none">
                  <Link
                    href={path}
                    prefetch={false}
                    className={cn(
                      `text-muted-foreground hover:text-muted-foreground/80
                      relative flex items-center gap-2 border-b-2
                      border-transparent py-4 text-sm font-semibold
                      transition-colors`,
                      isActive && "text-foreground border-primary"
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
