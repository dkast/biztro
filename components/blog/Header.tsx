import format from "date-fns/format"
import { es } from "date-fns/locale"
import React from "react"

const Header = ({ title, category, description, date, user }) => {
  return (
    <div className="my-20 text-center">
      <span className="bg-gradient-to-r from-orange-500 to-violet-500 bg-clip-text  font-medium text-transparent">
        {category}
      </span>
      <h1 className="font-display">{title}</h1>
      <p className="font-medium leading-relaxed text-gray-500 sm:text-xl md:text-2xl">
        {description}
      </p>
      <div>
        <p className="text-xs font-medium text-gray-500 md:text-sm">
          {format(new Date(date), "PPP", { locale: es })}
        </p>
      </div>
      <div>
        <span className="text-xs font-medium text-gray-500 md:text-sm">
          {user}
        </span>
      </div>
    </div>
  )
}

export default Header
