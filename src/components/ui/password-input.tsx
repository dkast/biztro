"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type: _type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const togglePasswordVisibility = () => setShowPassword(!showPassword)

    return (
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className={cn(
            "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300",
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-400">
          {showPassword ? (
            <EyeOff className="size-4" onClick={togglePasswordVisibility} />
          ) : (
            <Eye className="size-4" onClick={togglePasswordVisibility} />
          )}
        </div>
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input as PasswordInput }
