import React from "react"

interface MenuHeadingProps {
  title: string
  icon: React.ReactNode
}

const ToolboxComponent = ({ title, icon }: MenuHeadingProps): JSX.Element => {
  return (
    <div className="mb-1 flex cursor-move items-center gap-2 truncate rounded-lg p-2 text-sm transition-transform hover:scale-[1.01] hover:bg-zinc-800 hover:text-white">
      {icon}
      <span>{title}</span>
    </div>
  )
}

export default ToolboxComponent
