import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg text-sm border border-gray-200 p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-gray-950 dark:border-gray-800 dark:[&>svg]:text-gray-50",
  {
    variants: {
      variant: {
        default:
          "bg-white text-gray-950 [&_div]:text-gray-600 dark:bg-gray-950 dark:text-gray-50",
        destructive:
          "border-red-500/50 bg-red-50 text-red-800 [&_div]:text-red-700 dark:border-red-500 [&>svg]:text-red-500 dark:bg-red-400/10 dark:text-red-400 dark:border-red-900/50 dark:[&>svg]:text-red-600 dark:[&_div]:text-red-400",
        information:
          "border-blue-500/50 bg-blue-50 text-blue-800 [&_div]:text-blue-700 dark:border-blue-500 [&>svg]:text-blue-500 dark:bg-blue-400/10 dark:text-blue-400 dark:dark:border-blue-900/50 dark:[&>svg]:text-blue-600 dark:[&_div]:text-blue-400",
        success:
          "border-green-500/50 bg-green-50 text-green-800 [&_div]:text-green-700 dark:border-green-500 [&>svg]:text-green-500 dark:bg-green-400/10 dark:text-green-400 dark:border-green-900/50 dark:[&>svg]:text-green-600 dark:[&_div]:text-green-400",
        warning:
          "border-amber-500/50 bg-amber-50 text-amber-800 [&_div]:text-amber-700 dark:border-amber-500 [&>svg]:text-amber-500 dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-900/50 dark:[&>svg]:text-amber-400 dark:[&_div]:text-amber-400"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  className?: string
}

const Alert = ({ className, variant, ...props }: AlertProps) => (
  <div
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
)
Alert.displayName = "Alert"

const AlertTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h5
    className={cn("mb-1 leading-none font-medium tracking-tight", className)}
    {...props}
  />
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <div className={cn("text-xs [&_p]:leading-relaxed", className)} {...props} />
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
