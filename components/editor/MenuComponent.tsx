import React from "react"

interface MenuHeadingProps {
  title: string
  icon: React.ReactNode
}

const MenuComponent = ({ title, icon }: MenuHeadingProps) => {
  return (
    <div className="mb-1 flex cursor-move items-center gap-2 truncate rounded-lg p-2 text-sm transition-transform hover:scale-105 hover:bg-blue-500 hover:text-white">
      {icon}
      <span>{title}</span>
    </div>
  )
}

export default MenuComponent
