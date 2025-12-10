import { defineCollection, defineConfig } from "@content-collections/core"
import { compileMDX } from "@content-collections/mdx"
import rehypePrettyCode from "rehype-pretty-code"
import remarkGfm from "remark-gfm"
import { z } from "zod/v4"

const posts = defineCollection({
  name: "posts",
  directory: "content/blog",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    category: z.string(),
    description: z.string(),
    date: z.iso.date(),
    author: z.string(),
    position: z.string(),
    avatar: z.string(),
    content: z.string()
  }),
  transform: async (document, context) => {
    const body = await compileMDX(context, document, {
      rehypePlugins: [
        [
          rehypePrettyCode,
          {
            theme: "poimandres"
          }
        ]
      ],
      remarkPlugins: [remarkGfm]
    })
    return {
      ...document,
      body
    }
  }
})

export default defineConfig({
  collections: [posts]
})
