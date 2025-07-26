"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

// Tailwind colors
const colors = [
  "bg-amber-500 dark:bg-amber-400 text-amber-100",
  "bg-blue-500 dark:bg-blue-400 text-blue-100",
  "bg-cyan-500 dark:bg-cyan-400 text-cyan-100",
  "bg-emerald-500 dark:bg-emerald-400 text-emerald-100",
  "bg-fuchsia-500 dark:bg-fuchsia-400 text-fuchsia-100",
  "bg-gray-500 dark:bg-gray-400 text-gray-100",
  "bg-green-500 dark:bg-green-400 text-green-100",
  "bg-indigo-500 dark:bg-indigo-400 text-indigo-100",
  "bg-lime-500 dark:bg-lime-400 text-lime-100",
  "bg-orange-500 dark:bg-orange-400 text-orange-100",
  "bg-pink-500 dark:bg-pink-400 text-pink-100",
  "bg-purple-500 dark:bg-purple-400 text-purple-100",
  "bg-red-500 dark:bg-red-400 text-red-100",
  "bg-rose-500 dark:bg-rose-400 text-rose-100",
  "bg-sky-500 dark:bg-sky-400 text-sky-100",
  "bg-teal-500 dark:bg-teal-400 text-teal-100",
  "bg-violet-500 dark:bg-violet-400 text-violet-100",
  "bg-yellow-500 dark:bg-yellow-400 text-yellow-100"
]

// Get a random color from the list based on the hash of the name
const getColor = (name: string) => {
  const hash = name.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0)
  return colors[hash % colors.length]
}

const Avatar = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>) => (
  <AvatarPrimitive.Root
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
)
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>) => (
  <AvatarPrimitive.Image
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
)
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.memo(
  ({
    className,
    children,
    ...props
  }: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>) => {
    let text = ""

    // skipcq: JS-D008
    React.Children.map(children, child => {
      if (typeof child === "string") {
        text += child
      }
    })

    const colorClass = getColor(text)

    return (
      <AvatarPrimitive.Fallback
        className={cn(
          "flex h-full w-full items-center justify-center bg-amber-100 text-amber-900 dark:bg-lime-800 dark:text-lime-100",
          className,
          colorClass
        )}
        {...props}
      >
        {children}
      </AvatarPrimitive.Fallback>
    )
  }
)
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
