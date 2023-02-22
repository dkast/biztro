import React from "react"

const DEFAULT =
  "block w-full max-w-lg rounded-lg focus:outline-none sm:text-sm transition duration-150 ease-in-out"
const VARIANT = {
  default: "border-gray-300 focus:ring-zinc-600 focus:border-zinc-600",
  error:
    "pr-10 border-red-300 text-red-900 placeholder-red-300 focus:border-red-300 focus:ring-red-500 focus:border-red-500"
}
const MODE = {
  normal: "",
  disabled: "bg-gray-50 "
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLElement> {
  invalid?: boolean
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (props, forwardRef) => {
    const variant = "default"
    let mode = "normal"
    const { disabled, className } = props

    if (disabled) {
      mode = "disabled"
    }

    const cssClasses = [className, DEFAULT, VARIANT[variant], MODE[mode]].join(
      " "
    )

    return (
      <div className="relative mt-1 w-full max-w-lg rounded-md shadow-sm">
        <textarea ref={forwardRef} className={cssClasses} {...props} />
      </div>
    )
  }
)

TextArea.displayName = "TextArea"

export default TextArea
