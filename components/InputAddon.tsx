import React from "react"

import classnames from "@/lib/classnames"

interface InputAddonProps extends React.InputHTMLAttributes<HTMLElement> {
  addon: string
  invalid?: boolean
}

const InputAddon = React.forwardRef<HTMLInputElement, InputAddonProps>(
  (props, forwardRef) => {
    const { disabled, invalid, addon } = props
    return (
      <div className="mt-1 flex max-w-lg rounded-lg shadow-sm">
        <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
          {addon}
        </span>
        <input
          className={classnames(
            disabled ? "bg-gray-50" : "",
            invalid
              ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-300 focus:ring-red-500"
              : "border-gray-300 placeholder-gray-400 focus:border-zinc-600 focus:ring-zinc-600",
            "block w-full min-w-0 flex-1 rounded-none rounded-r-lg  px-3 py-2 transition duration-150  sm:text-sm"
          )}
          ref={forwardRef}
          {...props}
        />
      </div>
    )
  }
)

InputAddon.displayName = "InputAddon"

export default InputAddon
