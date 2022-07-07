import MainMenu from "../blog/MainMenu"
import Footer from "../blog/Footer"

type LayoutProps = {
  children: React.ReactNode
}
const BlogLayout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-screen flex-col items-center overflow-y-auto overflow-x-hidden">
      <MainMenu variant="light" />
      <div className="w-full grow">
        <div className="prose mx-auto max-w-2xl lg:prose-lg">{children}</div>
      </div>
      <Footer />
    </div>
  )
}

export default BlogLayout
