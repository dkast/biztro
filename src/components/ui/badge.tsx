import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full ring-1 ring-inset px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 dark:border-gray-800 dark:focus:ring-gray-300",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gray-900 text-gray-50 hover:bg-gray-900/80 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/80",
        secondary:
          "border-transparent bg-gray-100 text-gray-600 ring-gray-500/10 hover:bg-gray-100/80 dark:bg-gray-400/10 dark:text-gray-400 dark:hover:bg-gray-400/30",
        destructive:
          "border-transparent bg-red-50 text-red-700 ring-red-600/10 hover:bg-red-500/80 dark:bg-red-400/10 dark:text-red-400 dark:hover:bg-red-400/30",
        outline: "text-gray-950 dark:text-gray-50 ring-gray-500/60",
        violet:
          "border-transparent bg-violet-50 text-violet-700 ring-violet-700/10 hover:bg-violet-500/80 dark:bg-violet-400/10 dark:text-violet-400 dark:hover:bg-violet-400/30",
        green:
          "border-transparent bg-green-50 text-green-700 ring-green-600/20 hover:bg-green-500/80 dark:bg-green-400/10 dark:text-green-400 dark:hover:bg-green-400/30",
        yellow:
          "border-transparent bg-amber-50 text-amber-700 ring-amber-600/20 hover:bg-amber-500/80 dark:bg-amber-400/10 dark:text-amber-400 dark:hover:bg-amber-400/30",
        blue: "border-transparent bg-blue-50 text-blue-700 ring-blue-700/10 hover:bg-blue-500/80 dark:bg-blue-400/10 dark:text-blue-400 dark:hover:bg-blue-400/30"
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
