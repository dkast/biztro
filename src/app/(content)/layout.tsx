import Footer from "@/components/marketing/footer"
import Navbar from "@/components/marketing/nav-bar"

export default function BlogLayout({
  children
}: {
  children?: React.ReactNode
}) {
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 pt-16 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
