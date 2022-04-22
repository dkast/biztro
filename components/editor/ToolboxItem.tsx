import React from "react"

interface ToolboxItemProps {
  children: React.ReactNode
  label: string
}

const ToolboxItem = ({ children, label }: ToolboxItemProps): JSX.Element => {
  return (
    <div className="flex items-center justify-around px-2">
      <span className="w-1/3 text-sm">{label}</span>
      <div className="flex w-2/3 items-center">{children}</div>
    </div>
  )
}

export default ToolboxItem
