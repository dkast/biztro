import MainMenu from "../marketing/MainMenu"
import Footer from "../marketing/Footer"

type LayoutProps = {
  children: React.ReactNode
}
const BlogLayout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-screen flex-col items-center overflow-y-auto overflow-x-hidden">
      <MainMenu variant="light" />
      <div className="grow">{children}</div>
      <Footer />
    </div>
  )
}

export default BlogLayout
