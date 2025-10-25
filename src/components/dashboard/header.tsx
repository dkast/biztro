import Image from "next/image"

import ProfileMenu from "@/components/dashboard/profile-menu"
import { GuardLink as Link } from "@/components/dashboard/unsaved-changes-provider"
import { cn } from "@/lib/utils"

export default function Header({
  children,
  className,
  showLogo = true
}: {
  children?: React.ReactNode
  className?: string
  showLogo?: boolean
}) {
  return (
    <header
      className={cn("border-border bg-card z-50 flex h-16 border-b", className)}
    >
      <div className="mx-auto flex w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {showLogo && (
          <Link href="/dashboard">
            <Image src="/logo-bistro.svg" alt="Logo" width={32} height={32} />
          </Link>
        )}
        {children}
        <ProfileMenu />
      </div>
    </header>
  )
}
