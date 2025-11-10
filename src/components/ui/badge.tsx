import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md inset-ring px-2 py-1 text-xs font-medium transition-colors focus:outline-hidden",
  {
    variants: {
      variant: {
        // default: use the neutral/gray style from the snippet
        default:
          "bg-gray-50 text-gray-600 inset-ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:inset-ring-gray-400/20",
        // secondary kept same as neutral (alias)
        secondary:
          "bg-gray-50 text-gray-600 inset-ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:inset-ring-gray-400/20",
        // red / destructive
        destructive:
          "bg-red-50 text-red-700 inset-ring-red-600/10 dark:bg-red-400/10 dark:text-red-400 dark:inset-ring-red-400/20",
        // outline variant uses neutral text with subtle inset ring
        outline: "text-gray-950 dark:text-gray-50 inset-ring-gray-500/60",
        // violet / purple
        violet:
          "bg-violet-50 text-violet-700 inset-ring-violet-700/10 dark:bg-violet-400/10 dark:text-violet-400 dark:inset-ring-violet-400/30",
        // green
        green:
          "bg-green-50 text-green-700 inset-ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:inset-ring-green-500/20",
        // yellow
        yellow:
          "bg-yellow-50 text-yellow-800 inset-ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-500 dark:inset-ring-yellow-400/20",
        // blue
        blue: "bg-blue-50 text-blue-700 inset-ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:inset-ring-blue-400/30",
        // indigo
        indigo:
          "bg-indigo-50 text-indigo-700 inset-ring-indigo-700/10 dark:bg-indigo-400/10 dark:text-indigo-400 dark:inset-ring-indigo-400/30",
        // pink
        pink: "bg-pink-50 text-pink-700 inset-ring-pink-700/10 dark:bg-pink-400/10 dark:text-pink-400 dark:inset-ring-pink-400/20"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
