import React from "react"
import { RotateSpinner } from "react-spinners-kit"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "primary" | "secondary" | "danger" | "warn" | "flat"
  mode?: "full" | "normal"
  isLoading?: boolean
  size?: "xs" | "sm" | "md" | "lg"
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const DEFAULT =
  "w-full sm:w-auto inline-flex items-center justify-center border font-medium rounded-lg transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2"

const VARIANT = {
  primary:
    "border-transparent text-white bg-violet-600 hover:bg-violet-700 focus:ring-violet-700 active:bg-violet-800 shadow shadow-violet-400/50",
  secondary:
    "border-gray-300 text-gray-700 shadow bg-white hover:bg-gray-50 focus:ring-zinc-700 active:text-gray-800 active:bg-gray-200",
  warn: "border-transparent text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500 active:bg-red-300",
  danger:
    "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 active:bg-red-800",
  flat: "border-transparent text-gray-700 bg-white hover:bg-gray-100 focus:ring-zinc-700 active:text-gray-800 active:bg-gray-200"
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

const SIZE_ICON_LEFT = {
  xs: "-ml-0.5 mr-2 h-4 w-4",
  sm: "-ml-1 mr-2 h-4 w-4",
  md: "-ml-1 mr-3 h-5 w-5",
  lg: "-ml-1 mr-3 h-5 w-5"
}

const SIZE_ICON_RIGHT = {
  xs: "-mr-0.5 ml-2 h-4 w-4",
  sm: "-mr-1 ml-2 h-4 w-4",
  md: "-mr-1 ml-3 h-5 w-5",
  lg: "-mr-1 ml-3 h-5 w-5"
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  isLoading,
  variant,
  mode = "normal",
  size = "md",
  leftIcon,
  rightIcon,
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
      {isLoading ? (
        <span className="mr-2">
          <RotateSpinner size={16} color={"#FFF"}></RotateSpinner>
        </span>
      ) : null}
      {leftIcon ? <i className={SIZE_ICON_LEFT[size]}>{leftIcon}</i> : null}
      {children}
      {rightIcon ? <i className={SIZE_ICON_RIGHT[size]}>{rightIcon}</i> : null}
    </button>
  )
}

export default Button
