import React from "react"

interface MenuHeadingProps {
  title: string
  icon: React.ReactNode
}

const MenuComponent = ({ title, icon }: MenuHeadingProps) => {
  return (
    <div className="mb-1 flex cursor-move items-center gap-2 truncate rounded border p-2 text-sm shadow-sm">
      {icon}
      <span>{title}</span>
    </div>
  )
}

export default MenuComponent
