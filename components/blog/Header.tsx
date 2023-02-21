import format from "date-fns/format"
import { es } from "date-fns/locale"
import Image from "next/image"
import Link from "next/link"
import React from "react"

const Header = ({
  title,
  category,
  description,
  date,
  user,
  avatar,
  twitter
}) => {
  return (
    <div className="my-20 text-center">
      <span className="bg-gradient-to-r from-orange-500 to-violet-500 bg-clip-text  font-medium text-transparent">
        {category}
      </span>
      <h1 className="font-display">{title}</h1>
      <p className="font-medium leading-relaxed text-gray-500 sm:text-lg md:text-xl">
        {description}
      </p>
      <div>
        <div className="relative my-8">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-xs text-gray-500 md:text-sm">
              {format(new Date(date), "PPP", { locale: es })}
            </span>
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-fit flex-row items-center gap-2">
        <div className="relative h-[40px] w-[40px] overflow-hidden rounded-full border border-gray-100 shadow">
          <Image
            src={`/${avatar}`}
            alt={`Imagen de perfil de ${user}`}
            width={40}
            height={40}
            className="absolute inset-0"
          />
        </div>
        <div className="flex flex-col items-start justify-start">
          <span className="text-xs font-medium text-gray-500 md:text-sm">
            {user}
          </span>
          <Link href={`https://twitter.com/${twitter}`} passHref>
            <a className="text-xs no-underline md:text-sm">@{twitter}</a>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Header
