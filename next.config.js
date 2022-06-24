/** @type {import('next').NextConfig} */
const { withAxiom } = require("next-axiom")

const nextConfig = withAxiom({
  reactStrictMode: true,
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "images.unsplash.com",
      "res.cloudinary.com"
    ]
  }
})

module.exports = nextConfig
