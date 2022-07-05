import React from "react"

const Header = ({ title, user }) => {
  return (
    <div className="mt-16">
      <h1 className="font-display">{title}</h1>
      <div>
        <span>Autor:{user}</span>
      </div>
    </div>
  )
}

export default Header
