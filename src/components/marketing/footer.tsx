import Image from "next/image"

type Link = {
  text: string
  url: string
}

export const links: Link[] = [
  { text: "Términos", url: "/terms" },
  { text: "Privacidad", url: "/privacy" }
]

export default async function Footer() {
  "use cache"
  return (
    <footer
      className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-10 lg:pb-10"
    >
      <div className="flex items-center justify-between gap-x-5">
        <div className="flex items-center gap-x-2">
          <Image
            src="/safari-pinned-tab.svg"
            alt="Logo"
            width={24}
            height={24}
            className="opacity-30 dark:invert"
          />
          <p
            className="text-sm font-medium text-orange-950/50
              dark:text-orange-100/50"
          >
            <span className="hidden sm:inline">Biztro</span> &copy;{" "}
            {new Date().getFullYear()}
          </p>
        </div>

        <ul className="flex items-center justify-center gap-x-5 sm:gap-x-10">
          <a
            href="mailto:contacto@biztro.co"
            className="text-[15px]/normal font-medium text-orange-950/50
              transition-all duration-100 ease-linear hover:text-orange-950
              hover:underline hover:underline-offset-4 dark:font-medium
              dark:text-orange-100/50 dark:hover:text-orange-50"
          >
            Contacto
          </a>
          {links.map((link, index) => (
            <li
              key={index}
              className="text-[15px]/normal font-medium text-orange-950/50
                transition-all duration-100 ease-linear hover:text-orange-950
                hover:underline hover:underline-offset-4 dark:font-medium
                dark:text-orange-100/50 dark:hover:text-orange-50"
            >
              <a href={link.url}>{link.text}</a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
