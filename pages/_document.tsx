import Document, { Html, Head, Main, NextScript } from "next/document"

class MyDocument extends Document {
  render() {
    return (
      <Html className="h-full bg-gray-50">
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;700&display=swap"
            rel="stylesheet"
          />
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
