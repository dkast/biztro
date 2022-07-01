/** @type {import('next').NextConfig} */
const { withAxiom } = require("next-axiom")
const withMarkdoc = require("@markdoc/next.js")

const nextConfig = withAxiom(
  withMarkdoc()({
    reactStrictMode: true,
    images: {
      domains: [
        "lh3.googleusercontent.com",
        "images.unsplash.com",
        "res.cloudinary.com"
      ]
    },
    pageExtensions: ["md", "mdoc", "js", "jsx", "ts", "tsx"]
  })
)

module.exports = nextConfig
