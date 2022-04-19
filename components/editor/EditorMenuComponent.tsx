import React, { forwardRef } from "react"

interface EditorMenuHeadingProps {
  title: string
  icon: React.ReactNode
  ref: any
}

const EditorMenuComponent = forwardRef(
  ({ title, icon }: EditorMenuHeadingProps, ref) => {
    return (
      <div className="mb-1 flex cursor-move items-center gap-2 truncate rounded border p-2 text-sm shadow-sm">
        {icon}
        <span>{title}</span>
      </div>
    )
  }
)

EditorMenuComponent.displayName = "EditorMenuComponent"

export default EditorMenuComponent
