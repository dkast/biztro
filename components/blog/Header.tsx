import React from "react"

const Header = ({ title, category, description, date, user }) => {
  return (
    <div className="mt-16">
      <p>{category}</p>
      <h1 className="font-display">{title}</h1>
      <p>{description}</p>
      <div>
        <span>{date}</span>
      </div>
      <div>
        <span>Autor:{user}</span>
      </div>
    </div>
  )
}

export default Header
