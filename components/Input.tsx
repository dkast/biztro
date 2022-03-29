import React from "react"
import { ExclamationCircleIcon } from "@heroicons/react/solid"
import { UseFormRegister } from "react-hook-form"

const DEFAULT =
  "block w-full max-w-lg rounded-md sm:max-w-xs sm:text-sm transition duration-150 ease-in-out shadow-sm"
const VARIANT = {
  default: "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500",
  error:
    "pr-10 border-red-300 text-red-900 placeholder-red-300 focus:border-red-300 focus:ring-red-500 focus:border-red-500"
}
const MODE = {
  normal: "",
  disabled: "bg-gray-50 "
}
interface InputProps extends React.InputHTMLAttributes<HTMLElement> {
  name: string
  register: UseFormRegister<any>
  disabled?: boolean
  invalid?: boolean
  required?: boolean
}

const Input: React.FC<InputProps> = props => {
  let variant = "default"
  let mode = "normal"
  let { name, register, required } = props

  if (props.disabled) {
    mode = "disabled"
  }

  if (props.invalid) {
    variant = "error"
  }

  const cssClasses = [
    props.className,
    DEFAULT,
    VARIANT[variant],
    MODE[mode]
  ].join(" ")

  return (
    <>
      <div className="relative mt-1 w-full">
        <input
          type="text"
          className={cssClasses}
          {...register(name, { required })}
          {...props}
        />
        {props.invalid ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            />
          </div>
        ) : null}
      </div>
      {/* {props.invalid ? (
        <p className="mt-2 text-sm text-red-600">{meta.error}</p>
      ) : null} */}
    </>
  )
}

export default Input
