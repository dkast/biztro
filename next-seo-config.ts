const title = "Biztro"
const description = "Crea tu menú digital en minutos."

const SEO = {
  title,
  description,
  canonical: "https://biztro.co",
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://biztro.co",
    title,
    description,
    images: [
      {
        url: "https://biztro.co/og-image.jpg",
        width: 1230,
        height: 630,
        alt: "Biztro"
      }
    ]
  },
  twitter: {
    cardType: "summary_large_image"
  }
}

export default SEO
