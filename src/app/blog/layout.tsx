import Navbar from "@/app/blog/nav-bar"

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
      <footer className="m-8 mx-auto flex w-full max-w-3xl justify-between px-4 text-gray-500 lg:px-2 xl:px-0">
        <div>
          <span>&copy; Biztro {new Date().getFullYear()}</span>
        </div>
        <div>
          <a href="mailto:hola@biztro.co">Contacto</a>
        </div>
      </footer>
    </div>
  )
}
