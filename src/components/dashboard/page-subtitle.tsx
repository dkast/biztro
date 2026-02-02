import type { LucideIcon } from "lucide-react"

import InfoHelper from "@/components/dashboard/info-helper"
import { cn } from "@/lib/utils"

export default function PageSubtitle({
  title,
  description,
  additionalInfo,
  children,
  Icon,
  className
}: {
  title: string
  description?: string
  additionalInfo?: string
  children?: React.ReactNode
  Icon?: LucideIcon
  className?: string
}) {
  return (
    <div
      className={cn("md:flex md:items-center md:justify-between", className)}
    >
      {/* Icon */}
      {Icon && (
        <div
          className="mr-3 flex size-10 shrink-0 items-center justify-center
            rounded-lg bg-gray-50 text-gray-500 dark:bg-gray-900
            dark:text-gray-300"
        >
          <Icon className="size-6" />
        </div>
      )}
      {/* Title and description */}
      <div className="min-w-0 flex-1">
        <h2 className="text-base leading-5 font-semibold">{title}</h2>
        <div className="flex items-end gap-1">
          {description && (
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {description}
            </p>
          )}
          {additionalInfo && <InfoHelper>{additionalInfo}</InfoHelper>}
        </div>
      </div>
      {/* Attach buttons or other elements here */}
      {children && <div className="mt-4 flex md:mt-0 md:ml-4">{children}</div>}
    </div>
  )
}
