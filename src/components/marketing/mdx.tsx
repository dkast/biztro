import { MDXContent } from "@content-collections/mdx/react"

interface MdxProps {
  code: string
}

const Mdx = ({ code }: MdxProps) => {
  return (
    <div
      className="prose prose-gray dark:prose-invert lg:prose-lg
        prose-h2:font-medium prose-pre:-mx-6 prose-pre:rounded-none
        prose-pre:bg-gray-800 md:prose-pre:mx-0 md:prose-pre:rounded-lg
        max-w-none sm:px-0"
    >
      <MDXContent code={code} />
    </div>
  )
}

export default Mdx
