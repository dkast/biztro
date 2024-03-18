import ProfileMenu from "@/app/dashboard/profile-menu"
import Image from "next/image"
import Link from "next/link"

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 border-b border-gray-200 bg-white dark:border-gray-800">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard">
          <Image src="/logo-bistro.svg" alt="Logo" width={32} height={32} />
        </Link>
        <ProfileMenu />
      </div>
    </header>
  )
}
