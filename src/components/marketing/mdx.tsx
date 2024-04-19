import { useMDXComponent } from "next-contentlayer2/hooks"

interface MdxProps {
  code: string
}

const Mdx = ({ code }: MdxProps) => {
  const Component = useMDXComponent(code)

  return (
    <div className="prose prose-gray mx-6 max-w-none dark:prose-invert lg:prose-lg prose-pre:-mx-6 prose-pre:rounded-none prose-pre:bg-gray-800 sm:px-0 md:prose-pre:mx-0 md:prose-pre:rounded-lg">
      <Component />
    </div>
  )
}

export default Mdx
