import Header from "@/components/dashboard/header"

// import Sidebar from "@/components/dashboard/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex grow flex-col">
      <Header />
      {/* <Sidebar /> */}
      <div className="flex grow flex-col pt-16 lg:pl-60">{children}</div>
    </div>
  )
}
