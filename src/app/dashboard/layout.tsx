import Header from "@/app/dashboard/header"
import Sidebar from "@/app/dashboard/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex grow flex-col">
      <Header />
      <Sidebar />
      <div className="grow bg-gray-50 pt-14 lg:pl-60">{children}</div>
    </div>
  )
}
