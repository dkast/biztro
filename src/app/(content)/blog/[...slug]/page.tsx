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
        avatar={post?.avatar}
      />
      <section>
        <Mdx code={post.body.code} />
      </section>
      <section>
        <Separator className="my-10 w-20 bg-gray-300" />
        <div className="flex flex-col items-center gap-4">
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
    <div className="mt-20">
      <div className="space-y-6">
        <div className="flex flex-row items-center gap-2 text-xs font-medium text-gray-400 md:text-sm">
          <time>{formattedDate},</time>
          <div className="flex flex-row items-center gap-2">
            <span>por</span>
            <div className="relative h-[20px] w-[20px] overflow-hidden rounded-full border border-gray-200/70 shadow-md">
              <Image
                src={`/${avatar}`}
                alt={`Imagen de perfil de ${author}`}
                width={20}
                height={20}
                className="absolute inset-0"
              />
            </div>
            <span className="text-gray-600">{author}</span>
          </div>
          <Separator orientation="vertical" className="mx-2 h-5 bg-gray-300" />
          <span className="text-xs font-medium text-orange-500 md:text-sm">
            {category}
          </span>
        </div>
        <h1 className="font-display text-3xl font-medium sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="font-medium leading-relaxed text-gray-500 sm:text-lg md:text-xl">
            {description}
          </p>
        )}
      </div>
      <Separator className="my-10 w-20 bg-gray-300" />
    </div>
  )
}
