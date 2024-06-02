import type { LucideIcon } from "lucide-react"

export default function PageSubtitle({
  title,
  description,
  children,
  Icon
}: {
  title: string
  description?: string
  children?: React.ReactNode
  Icon?: LucideIcon
}) {
  return (
    <div className="md:flex md:items-center md:justify-between">
      {/* Icon */}
      {Icon && (
        <div className="mr-3 flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-300">
          <Icon className="size-6" />
        </div>
      )}
      {/* Title and description */}
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-semibold leading-5 text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {/* Attach buttons or other elements here */}
      {children && <div className="mt-4 flex md:ml-4 md:mt-0">{children}</div>}
    </div>
  )
}
