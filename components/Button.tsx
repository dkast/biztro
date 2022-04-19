import React from "react"
import { RotateSpinner } from "react-spinners-kit"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "primary" | "secondary" | "danger" | "warn"
  mode?: "full" | "normal"
  isLoading?: boolean
  size?: "xs" | "sm" | "md" | "lg"
  leftIcon?: React.ReactNode
}

const DEFAULT =
  "w-full sm:w-auto inline-flex items-center justify-center border font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"

const VARIANT = {
  primary:
    "border-transparent text-white bg-zinc-800 hover:bg-zinc-700 focus:ring-zinc-700 active:bg-zinc-900",
  secondary:
    "border-gray-300 text-gray-700 shadow bg-white hover:bg-gray-50 focus:ring-zinc-700 active:text-gray-800 active:bg-gray-200",
  warn: "border-transparent text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500 active:bg-red-300",
  danger:
    "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 active:bg-red-800"
}

const MODE = {
  full: "w-full justify-center sm:w-full",
  normal: ""
}

const SIZE = {
  xs: "px-2.5 py-1.5 text-xs",
  sm: "px-4 py-2 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-base"
}

const SIZE_ICON = {
  xs: "-ml-0.5 mr-2 h-4 w-4",
  sm: "-ml-1 mr-2 h-4 w-4",
  md: "-ml-1 mr-3 h-5 w-5",
  lg: "-ml-1 mr-3 h-5 w-5"
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  isLoading,
  variant,
  mode = "normal",
  size = "md",
  leftIcon,
  ...props
}) => {
  const cssClasses = [
    className,
    DEFAULT,
    SIZE[size],
    VARIANT[variant],
    MODE[mode]
  ].join(" ")

  return (
    <button className={cssClasses} {...props}>
      <>
        {isLoading ? (
          <span className="mr-2">
            <RotateSpinner size={16} color={"#FFF"}></RotateSpinner>
          </span>
        ) : null}
        {leftIcon ? <i className={SIZE_ICON[size]}>{leftIcon}</i> : null}
        {children}
      </>
    </button>
  )
}

export default Button
