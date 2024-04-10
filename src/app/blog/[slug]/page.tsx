import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { posts } from "../data"

export function generateStaticParams() {
  return posts.paths().map(pathname => ({ slug: pathname.at(-1) }))
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await posts.get(`blog/${params.slug}`)

  if (!post) {
    console.log("post not found")
    return notFound()
  }
  const { Content, frontMatter } = post

  if (!Content) {
    console.log("Content not found")
    return notFound()
  }

  const formattedDate = new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC"
  }).format(new Date(frontMatter?.date))

  return (
    <>
      <Header
        title={frontMatter?.title}
        category={frontMatter?.category}
        description={frontMatter?.description}
        formattedDate={formattedDate}
        user={frontMatter?.user}
        avatar={frontMatter?.avatar}
        twitter={frontMatter?.twitter}
      />
      <section className="prose lg:prose-lg prose-h2:font-display prose-h2:font-medium">
        <Content renderTitle={true} />
      </section>
    </>
  )
}

function Header({
  title,
  category,
  description,
  formattedDate,
  user,
  avatar,
  twitter
}: {
  title: string
  category: string
  description: string
  formattedDate: string
  user: string
  avatar: string
  twitter: string
}) {
  return (
    <div className="my-20 text-center">
      <div className="space-y-6">
        <span className="rounded-full border bg-gradient-to-r from-orange-500 to-violet-500 bg-clip-text px-3 py-0.5 font-medium text-transparent">
          {category}
        </span>
        <h1 className="font-display text-5xl font-medium">{title}</h1>
        <p className="font-medium leading-relaxed text-gray-500 sm:text-lg md:text-xl">
          {description}
        </p>
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
            alt={`Imagen de perfil de ${user}`}
            width={40}
            height={40}
            className="absolute inset-0"
          />
        </div>
        <div className="flex flex-col items-start justify-start">
          <span className="text-xs font-medium text-gray-500 md:text-sm">
            {user}
          </span>
          <Link
            href={`https://twitter.com/${twitter}`}
            className="text-xs no-underline md:text-sm"
          >
            @{twitter}
          </Link>
        </div>
      </div>
    </div>
  )
}
