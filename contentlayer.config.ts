import {
  defineDocumentType,
  makeSource,
  type ComputedFields,
  type LocalDocument
} from "contentlayer2/source-files"
import rehypePrettyCode, { type LineElement } from "rehype-pretty-code"
import remarkGfm from "remark-gfm"

const computedFields: ComputedFields = {
  slug: {
    type: "string",
    resolve: (doc: LocalDocument) => `/${doc._raw.flattenedPath}`
  },
  slugAsParams: {
    type: "string",
    resolve: (doc: LocalDocument) =>
      doc._raw.flattenedPath.split("/").slice(1).join("/")
  }
}

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: "blog/**/*.mdx",
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true
    },
    category: {
      type: "string",
      required: true
    },
    description: {
      type: "string"
    },
    date: {
      type: "date",
      required: true
    },
    author: {
      type: "string",
      required: true
    },
    published: {
      type: "boolean",
      default: true
    },
    avatar: {
      type: "string",
      required: true
    },
    image: {
      type: "string"
    }
  },
  computedFields
}))

export const Page = defineDocumentType(() => ({
  name: "Page",
  filePathPattern: "pages/**/*.mdx",
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true
    }
  },
  computedFields
}))

export default makeSource({
  contentDirPath: "./content",
  documentTypes: [Page, Post],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: "poimandres",
          keepBackground: true,
          onVisitLine(node: LineElement) {
            // Prevent lines from collapsing in `display: grid` mode, and allow empty
            // lines to be copy/pasted
            if (node.children.length === 0) {
              node.children = [{ type: "text", value: " " }]
            }
          },
          onVisitHighlightedLine(node: LineElement) {
            node.properties.className?.push("line--highlighted")
          },
          onVisitHighlightedWord(node: LineElement) {
            node.properties.className = ["word--highlighted"]
          }
        }
      ]
    ]
  }
})
