import { allPosts } from "contentlayer/generated"
import Image from "next/image"
import { notFound } from "next/navigation"

import Mdx from "@/components/marketing/mdx"
import Waitlist from "@/components/marketing/waitlist"
import { Separator } from "@/components/ui/separator"

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
    month: "long",
    day: "numeric"
  }).format(new Date(post?.date))

  return (
    <>
      <Header
        title={post?.title}
        category={post?.category}
        description={post?.description}
        formattedDate={formattedDate}
        author={post?.author}
        position={post?.position}
        avatar={post?.avatar}
      />
      <section>
        <Mdx code={post.body.code} />
      </section>
      <section>
        <Separator className="my-10 w-20 bg-gray-300" />
        <div className="flex flex-col items-center gap-4 text-center">
          <h3 className="text-xl font-medium sm:text-2xl">
            ¿Quieres participar en nuestro programa beta?
          </h3>
          <span className="text-gray-500">
            Únete a nuestra lista de espera para recibir una invitación
          </span>
          <div className="my-5">
            <Waitlist />
          </div>
        </div>
      </section>
    </>
  )
}

function Header({
  title,
  category,
  formattedDate,
  author,
  position,
  avatar
}: {
  title: string
  category: string
  description?: string
  formattedDate: string
  author: string
  position: string
  avatar: string
}) {
  return (
    <div className="mb-10 mt-20">
      <div className="space-y-6">
        <div className="flex flex-row items-center gap-2 text-xs font-medium text-gray-400 md:text-sm">
          <time>{formattedDate}</time>
          <Separator orientation="vertical" className="mx-2 h-5 bg-gray-300" />
          <span className="text-xs font-medium text-orange-500 md:text-sm">
            {category}
          </span>
        </div>
        <h1 className="font-display text-4xl font-medium sm:text-5xl">
          {title}
        </h1>
        <div className="flex items-center gap-3">
          <Image
            src={`/${avatar}`}
            alt={`Imagen de perfil de ${author}`}
            width={44}
            height={44}
            className="rounded-full shadow-md"
          />
          <div className="flex flex-col">
            <span className="text-base lg:text-lg lg:leading-tight">
              {author}
            </span>
            <span className="text-sm text-gray-400 lg:text-base">
              {position}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
