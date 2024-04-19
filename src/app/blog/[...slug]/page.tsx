import { allPosts } from "contentlayer/generated"
import Image from "next/image"
import { notFound } from "next/navigation"

import Mdx from "@/components/marketing/mdx"

// skipcq: JS-0116
export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return allPosts.map(post => ({
    slug: post.slugAsParams.split("/")
  }))
}
export default function Page({ params }: { params: { slug: string[] } }) {
  const slug = params?.slug?.join("/")
  const post = allPosts.find(post => post.slugAsParams === slug)

  if (!post) {
    return notFound()
  }

  const formattedDate = new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC"
  }).format(new Date(post?.date))

  return (
    <>
      <Header
        title={post?.title}
        category={post?.category}
        description={post?.description}
        formattedDate={formattedDate}
        author={post?.author}
        avatar={post?.avatar}
      />
      <section className="prose lg:prose-lg prose-h2:font-display prose-h2:font-medium">
        <Mdx code={post.body.code} />
      </section>
    </>
  )
}

function Header({
  title,
  category,
  description,
  formattedDate,
  author,
  avatar
}: {
  title: string
  category: string
  description?: string
  formattedDate: string
  author: string
  avatar: string
}) {
  return (
    <div className="my-20 text-center">
      <div className="space-y-6">
        <span className="rounded-full border bg-gradient-to-r from-orange-500 to-violet-500 bg-clip-text px-3 py-0.5 font-medium text-transparent">
          {category}
        </span>
        <h1 className="font-display text-5xl font-medium">{title}</h1>
        {description && (
          <p className="font-medium leading-relaxed text-gray-500 sm:text-lg md:text-xl">
            {description}
          </p>
        )}
      </div>
      <div>
        <div className="relative my-8">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center">
            <time className="bg-white px-4 text-xs text-gray-500 md:text-sm">
              {formattedDate}
            </time>
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-fit flex-row items-center gap-2">
        <div className="relative h-[40px] w-[40px] overflow-hidden rounded-full border border-gray-100 shadow">
          <Image
            src={`/${avatar}`}
            alt={`Imagen de perfil de ${author}`}
            width={40}
            height={40}
            className="absolute inset-0"
          />
        </div>
        <div className="flex flex-col items-start justify-start">
          <span className="text-xs font-medium text-gray-500 md:text-sm">
            {author}
          </span>
        </div>
      </div>
    </div>
  )
}
