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
          "border-rose-500/50 bg-rose-50 text-rose-800 [&_div]:text-rose-700 dark:border-rose-500 [&>svg]:text-rose-500 dark:bg-rose-400/10 dark:text-rose-400 dark:border-rose-900/50 dark:[&>svg]:text-rose-600 dark:[&_div]:text-rose-400",
        information:
          "border-sky-500/50 bg-sky-50 text-sky-800 [&_div]:text-sky-700 dark:border-sky-500 [&>svg]:text-sky-500 dark:bg-sky-400/10 dark:text-sky-400 dark:dark:border-sky-900/50 dark:[&>svg]:text-sky-600 dark:[&_div]:text-sky-400",
        success:
          "border-emerald-500/50 bg-emerald-50 text-emerald-800 [&_div]:text-emerald-700 dark:border-emerald-500 [&>svg]:text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400 dark:border-emerald-900/50 dark:[&>svg]:text-emerald-600 dark:[&_div]:text-emerald-400",
        warning:
          "border-amber-500/50 bg-amber-50 text-amber-800 [&_div]:text-amber-700 dark:border-amber-500 [&>svg]:text-amber-500 dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-500/50 dark:[&>svg]:text-amber-400 dark:[&_div]:text-amber-400"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

interface AlertProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
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
