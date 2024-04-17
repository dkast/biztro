import Image from "next/image"

import ProfileMenu from "@/components/dashboard/profile-menu"
import { GuardLink as Link } from "@/components/dashboard/unsaved-changes-provider"

export default function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 border-b border-gray-200 bg-white dark:border-gray-800">
      <div className="mx-auto flex w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard">
          <Image src="/logo-bistro.svg" alt="Logo" width={32} height={32} />
        </Link>
        {children}
        <ProfileMenu />
      </div>
    </header>
  )
}
