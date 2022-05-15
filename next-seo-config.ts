const title = "Bistro"
const description = "Tu slogan va aqui."

const SEO = {
  title,
  description,
  canonical: "https://bistro.vercel.app",
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://bistro.vercel.app",
    title,
    description
  },
  twitter: {
    cardType: "summary_large_image"
  }
}

export default SEO
