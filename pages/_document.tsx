import Document, { Head, Html, Main, NextScript } from "next/document"

class MyDocument extends Document {
  render() {
    return (
      <Html className="h-full bg-white">
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;500;600;700&family=Sora:wght@600&display=swap"
            rel="stylesheet"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#f84e32" />
          <meta name="msapplication-TileColor" content="#603cba" />
          <meta name="theme-color" content="#ffffff" />
        </Head>
        <body className="h-full overflow-hidden">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
