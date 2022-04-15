import React from "react"
import { UseFormRegister } from "react-hook-form"

const DEFAULT =
  "block w-full max-w-lg rounded-md focus:outline-none sm:text-sm transition duration-150 ease-in-out"
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
  name: string
  register: UseFormRegister<any>
  disabled?: boolean
  invalid?: boolean
  required?: boolean
}

const TextArea: React.FC<TextAreaProps> = props => {
  let variant = "default"
  let mode = "normal"
  const { name, register, required, disabled, className } = props

  if (disabled) {
    mode = "disabled"
  }

  const cssClasses = [className, DEFAULT, VARIANT[variant], MODE[mode]].join(
    " "
  )

  return (
    <>
      <div className="relative mt-1 w-full max-w-lg rounded-md shadow-sm">
        <textarea
          className={cssClasses}
          {...register(name, { required })}
          {...props}
        />
      </div>
    </>
  )
}

export default TextArea
