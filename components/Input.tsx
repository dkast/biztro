import React from "react"
import { ExclamationCircleIcon } from "@heroicons/react/solid"

const DEFAULT =
  "block w-full rounded-lg transition duration-150 ease-in-out shadow-sm"
const VARIANT = {
  default:
    "border-gray-300 focus:ring-zinc-600 focus:border-zinc-600 placeholder-gray-400",
  error:
    "pr-10 border-red-300 text-red-900 placeholder-red-300 focus:border-red-300 focus:ring-red-500 focus:border-red-500"
}
const MODE = {
  normal: "",
  disabled: "bg-gray-50 "
}
interface InputProps extends React.InputHTMLAttributes<HTMLElement> {
  invalid?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (props, forwardRef) => {
    let variant = "default"
    let mode = "normal"
    const { disabled, invalid, className } = props

    if (disabled) {
      mode = "disabled"
    }

    if (invalid) {
      variant = "error"
    }

    const cssClasses = [className, DEFAULT, VARIANT[variant], MODE[mode]].join(
      " "
    )

    return (
      <div className="relative mt-1 w-full max-w-lg sm:text-sm">
        <input type="text" className={cssClasses} {...props} ref={forwardRef} />
        {invalid ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            />
          </div>
        ) : null}
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input
