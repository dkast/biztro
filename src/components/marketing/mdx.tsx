import { MDXContent } from "@content-collections/mdx/react"

interface MdxProps {
  code: string
}

const Mdx = ({ code }: MdxProps) => {
  return (
    <div className="typeset typeset-reading">
      <MDXContent code={code} />
    </div>
  )
}

export default Mdx
